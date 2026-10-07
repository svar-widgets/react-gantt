import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { locate, locateID, getID, setID } from '@svar-ui/lib-dom';
import storeContext from '../../context';
import { useStore, useStoreWithCounter } from '@svar-ui/lib-react';
import {
  isSegmentMoveAllowed,
  extendDragOptions,
  calcScaleCellDate,
  getDiffer,
} from '@svar-ui/gantt-store';
import { Button, context } from '@svar-ui/react-core';
import { getUnitStart, getTaskAtRow } from '../../helpers/chart.js';
import Links from './Links.jsx';
import BarSegments from './BarSegments.jsx';
import Rollups from './Rollups.jsx';
import './Bars.css';

/** Hide constraint badge when it collides with the deadline marker. */
const CONSTRAINT_DEADLINE_COLLISION = 48;

function isConstraintCompact(task) {
  if (
    typeof task.$x_constraint !== 'number' ||
    typeof task.$x_deadline !== 'number'
  )
    return false;
  return (
    Math.abs(task.$x_constraint - task.$x_deadline) <
    CONSTRAINT_DEADLINE_COLLISION
  );
}

function scheduleStyle(task) {
  return {
    left: `${task.left}px`,
    top: `${task.y}px`,
    width: `${task.w}px`,
    height: `${task.h}px`,
  };
}

function deadlineStyle(task) {
  return {
    left: `${task.$x_deadline}px`,
    top: `${task.$y}px`,
    height: `${task.$h}px`,
  };
}

function constraintStyle(task) {
  return {
    left: `${task.$x_constraint}px`,
    top: `${task.$y - 2}px`,
    height: `${task.$h + 4}px`,
  };
}

// Arrow points into the open side. Floors open right, ceilings open left.
// Must-start / must-finish are pins and have no arrow. mso still keeps the badge on the left.
function isMustConstraint(type) {
  return type === 'mso' || type === 'mfo';
}

function constraintOpensRight(type) {
  return type === 'snet' || type === 'fnet' || type === 'mso';
}

function Bars(props) {
  const { readonly, taskTemplate: TaskTemplate } = props;

  const i18n = useContext(context.i18n);
  const _ = useMemo(() => i18n.getGroup('gantt'), [i18n]);
  const api = useContext(storeContext);

  const [rTasksValue, rTasksCounter] = useStoreWithCounter(api, '_tasks');
  const [rLinksValue, rLinksCounter] = useStoreWithCounter(api, '_links');
  const areaValue = useStore(api, 'area');
  const scalesValue = useStore(api, '_scales');
  const taskTypesValue = useStore(api, 'taskTypes');
  const baselinesValue = useStore(api, 'baselines');
  const selectedValue = useStore(api, '_selected');
  const rollups = useStore(api, 'rollups');
  const rRollups = useStore(api, '_rollups');
  const focusTaskStore = useStore(api, 'focusTask');
  const criticalPath = useStore(api, 'criticalPath');
  const schedule = useStore(api, 'schedule');
  const splitTasks = useStore(api, 'splitTasks');
  const summary = useStore(api, 'summary');
  const slack = useStore(api, 'slack');
  const cellHeight = useStore(api, 'cellHeight');
  const unscheduledTasks = useStore(api, 'unscheduledTasks');
  const inactiveTasks = useStore(api, 'inactiveTasks');
  const deadlines = useStore(api, 'deadlines');
  const conflicts = useStore(api, '_conflicts');
  const placeholderRow = useStore(api, 'placeholderRow');
  const durationUnit = useStore(api, 'durationUnit');

  const constraintViolated = conflicts?.constraints;

  const tasks = useMemo(() => {
    if (!areaValue || !Array.isArray(rTasksValue)) return [];
    const start = areaValue.start ?? 0;
    const end = areaValue.end ?? 0;
    return rTasksValue.slice(start, end).map((a) => ({ ...a }));
  }, [rTasksCounter, areaValue]);

  const lengthUnitWidth = useMemo(
    () => scalesValue.lengthUnitWidth,
    [scalesValue],
  );

  const hasDuplicatedIds = useMemo(
    () => tasks.some((task) => task.$id && task.$id !== task.id),
    [tasks],
  );

  const ignoreNextClickRef = useRef(false);

  const [linkFrom, setLinkFrom] = useState(undefined);
  const linkValidatorRef = useRef(null);
  const [taskMove, setTaskMove] = useState(null);
  // task scheduling
  const [taskSchedule, setTaskSchedule] = useState(null);
  const progressFromRef = useRef(null);

  const [selectedLinkId, setSelectedLinkId] = useState(null);

  const selectedLink = useMemo(() => {
    return (
      selectedLinkId && {
        ...rLinksValue.find((link) => link.id === selectedLinkId),
      }
    );
  }, [selectedLinkId, rLinksCounter]);

  const [touched, setTouched] = useState(undefined);
  const touchTimerRef = useRef(null);

  const [totalWidth, setTotalWidth] = useState(0);

  const containerRef = useRef(null);

  const hasFocus = useMemo(() => {
    const el = containerRef.current;
    return !!(
      selectedValue.length &&
      el &&
      el.contains(document.activeElement)
    );
  }, [selectedValue, containerRef.current]);

  const focused = useMemo(() => {
    return hasFocus && selectedValue[selectedValue.length - 1]?.id;
  }, [hasFocus, selectedValue]);

  useEffect(() => {
    if (!focusTaskStore) return;
    if (!focusTaskStore.section || focusTaskStore.section === 'chart') {
      const { id } = focusTaskStore;
      const node = containerRef.current?.querySelector(
        `.wx-bar[data-id='${setID(id)}']`,
      );
      if (node) node.focus({ preventScroll: true });
    }
  }, [focusTaskStore]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setTotalWidth(el.offsetWidth || 0);
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]) {
          setTotalWidth(entries[0].contentRect.width);
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [containerRef.current]);

  const startDrag = useCallback(() => {
    document.body.style.userSelect = 'none';
    if (containerRef.current) containerRef.current.style.cursor = '';
  }, []);

  const endDrag = useCallback(() => {
    document.body.style.userSelect = '';
    if (containerRef.current) containerRef.current.style.cursor = '';
  }, []);

  const getTaskAtY = useCallback(
    (clientY, rect = containerRef.current.getBoundingClientRect()) => {
      return getTaskAtRow(rTasksValue, clientY - rect.top, cellHeight);
    },
    [rTasksCounter, cellHeight],
  );

  const canScheduleTask = useCallback(
    (task) => {
      if (!task) return false;
      if (task.$placeholder) return placeholderRow;
      return (
        unscheduledTasks &&
        task.unscheduled &&
        (task.type === 'task' || task.type === 'milestone') &&
        !task.$group
      );
    },
    [placeholderRow, unscheduledTasks],
  );

  const isScheduleWorkingDay = useCallback(
    (task, left) => {
      const date = calcScaleCellDate(left, api.getState());
      const calendar = api.getTaskCalendar(task);
      if (calendar) return calendar.isWorkingDay(date);

      return true;
    },
    [api],
  );

  const getUnitStartY = useCallback(
    (y) => Math.trunc(y / cellHeight) * cellHeight,
    [cellHeight],
  );

  const getMoveMode = useCallback(
    (node, e, task) => {
      if (e.target.classList.contains('wx-line')) return '';
      if (!task) task = api.getTask(getID(node));
      if (task.type === 'milestone') return '';
      if (task.type === 'summary' && !(schedule?.auto && task.manual))
        return '';

      const segmentNode = locate(e, 'data-segment');
      if (segmentNode) node = segmentNode;

      const { left, width } = node.getBoundingClientRect();
      const p = (e.clientX - left) / width;
      let delta = 0.2 / (width > 200 ? width / 200 : 1);
      if (p < delta) return 'start';
      if (p > 1 - delta) return 'end';
      return '';
    },
    [api, schedule],
  );

  const down = useCallback(
    (node, point) => {
      const { clientX, clientY } = point;
      if (point.target.closest('.wx-delete-button')) return;
      if (!readonly) {
        if (!node && (unscheduledTasks || placeholderRow)) {
          const rowTask = getTaskAtY(clientY);
          const rect = containerRef.current.getBoundingClientRect();
          const left = getUnitStart(clientX - rect.left, lengthUnitWidth);
          if (canScheduleTask(rowTask) && isScheduleWorkingDay(rowTask, left)) {
            const isMilestone = rowTask && rowTask.type === 'milestone';
            setTaskSchedule({
              x: left,
              cx: left,
              left: isMilestone ? left - rowTask.$h / 2 : left,
              y: rowTask ? rowTask.$y : getUnitStartY(clientY - rect.top) + 3,
              h: rowTask ? rowTask.$h : cellHeight - 7,
              w: isMilestone ? rowTask.$h : lengthUnitWidth,
              task: rowTask,
              isMilestone,
            });
            startDrag();
            return;
          }
        }
        if (!node) return;

        const id = getID(node);
        const task = api.getTask(id);
        const css = point.target.classList;
        if (css.contains('wx-progress-marker')) {
          const { progress } = api.getTask(id);
          progressFromRef.current = {
            id,
            x: clientX,
            progress,
            dx: 0,
            node,
            marker: point.target,
          };
          point.target.classList.add('wx-progress-in-drag');
        } else {
          const mode = getMoveMode(node, point, task) || 'move';

          const newTaskMove = {
            id,
            mode,
            x: clientX,
            dx: 0,
            l: task.$x,
            w: task.$w,
          };

          if (splitTasks && task.segments?.length) {
            const segNode = locate(point, 'data-segment');
            if (segNode) {
              newTaskMove.segmentIndex = segNode.dataset['segment'] * 1;
              extendDragOptions(task, newTaskMove);
            }
          }

          setTaskMove(newTaskMove);
        }
        startDrag();
      }
    },
    [
      api,
      readonly,
      getMoveMode,
      startDrag,
      splitTasks,
      unscheduledTasks,
      placeholderRow,
      getTaskAtY,
      lengthUnitWidth,
      canScheduleTask,
      isScheduleWorkingDay,
      getUnitStartY,
      cellHeight,
    ],
  );

  const mousedown = useCallback(
    (e) => {
      if (e.button !== 0) return;

      const node = locate(e);
      down(node, e);
    },
    [down],
  );

  const touchstart = useCallback(
    (e) => {
      const node = locate(e);
      if (node) {
        touchTimerRef.current = setTimeout(() => {
          setTouched(true);
          down(node, e.touches[0]);
        }, 300);
      }
    },
    [down],
  );

  const onSelectLink = useCallback((id) => {
    setSelectedLinkId(id);
  }, []);

  const up = useCallback(() => {
    if (progressFromRef.current) {
      const { dx, id, marker, value } = progressFromRef.current;
      progressFromRef.current = null;
      if (typeof value !== 'undefined' && dx)
        api.exec('update-task', {
          id,
          task: { progress: value },
          inProgress: false,
        });
      marker.classList.remove('wx-progress-in-drag');

      ignoreNextClickRef.current = true;
      endDrag();
    } else if (taskMove) {
      const { id, mode, dx, l, w, start, segment, index } = taskMove;
      setTaskMove(null);
      if (start) {
        const diff = Math.round(dx / lengthUnitWidth);

        if (!diff) {
          api.exec('drag-task', {
            id,
            width: w,
            left: l,
            inProgress: false,
            ...(segment && { segmentIndex: index }),
          });
        } else {
          let update = {};
          let task = api.getTask(id);
          if (segment) task = task.segments[index];

          if (mode === 'move') {
            update.start = task.start;
            update.end = task.end;
          } else update[mode] = task[mode];

          api.exec('update-task', {
            id,
            diff,
            task: update,
            ...(segment && { segmentIndex: index }),
          });
        }
        ignoreNextClickRef.current = true;
      }

      endDrag();
    } else if (taskSchedule) {
      const { left, w, task, isMilestone } = taskSchedule;
      const state = api.getState();
      const start = calcScaleCellDate(isMilestone ? left + w / 2 : left, state);
      const end = calcScaleCellDate(left + w, state);
      const differ = getDiffer(durationUnit, api.getCalendar());
      const dates = isMilestone
        ? { start, duration: 0 }
        : { start, duration: Math.max(1, differ(end, start)) };
      if (task.$placeholder) {
        api.exec('add-task', {
          task: {
            ...dates,
            text: _('New task'),
            type: 'task',
            eventSource: 'placeholder',
          },
        });
      } else api.exec('update-task', { id: task.id, task: dates });

      setTaskSchedule(null);
      ignoreNextClickRef.current = true;
      endDrag();
    }
  }, [api, endDrag, taskMove, taskSchedule, lengthUnitWidth, durationUnit, _]);

  const move = useCallback(
    (e, point) => {
      const { clientX, clientY } = point;

      if (!readonly) {
        if (progressFromRef.current) {
          const { node, x, id } = progressFromRef.current;
          const dx = (progressFromRef.current.dx = clientX - x);

          const diff = Math.round((dx / node.offsetWidth) * 100);
          let progress = progressFromRef.current.progress + diff;
          progressFromRef.current.value = progress = Math.min(
            Math.max(0, progress),
            100,
          );

          api.exec('update-task', {
            id,
            task: { progress },
            inProgress: true,
          });
        } else if (taskMove) {
          onSelectLink(null);
          const { mode, l, w, x, id, start, segment, index } = taskMove;
          const task = api.getTask(id);
          const dx = clientX - x;
          const minWidth = Math.round(lengthUnitWidth) || 1;
          if (
            (!start && Math.abs(dx) < 20) ||
            (mode === 'start' && w - dx < minWidth) ||
            (mode === 'end' && w + dx < minWidth) ||
            (mode === 'move' &&
              ((dx < 0 && l + dx < 0) ||
                (dx > 0 && l + w + dx > totalWidth))) ||
            (taskMove.segment && !isSegmentMoveAllowed(task, taskMove))
          )
            return;

          const nextTaskMove = { ...taskMove, dx };

          let left, width;
          if (mode === 'start') {
            left = l + dx;
            width = w - dx;
          } else if (mode === 'end') {
            left = l;
            width = w + dx;
          } else if (mode === 'move') {
            left = l + dx;
            width = w;
          }

          api.exec('drag-task', {
            id,
            width: width,
            left: left,
            inProgress: true,
            start,
            ...(segment && { segmentIndex: index }),
          });

          if (
            !nextTaskMove.start &&
            ((mode === 'move' && task.$x === l) ||
              (mode !== 'move' && task.$w === w))
          ) {
            ignoreNextClickRef.current = true;
            up();
            return;
          }
          nextTaskMove.start = true;
          setTaskMove(nextTaskMove);
        } else if (taskSchedule) {
          const { isMilestone, x, w, cx } = taskSchedule;
          const rect = containerRef.current.getBoundingClientRect();
          const current = getUnitStart(clientX - rect.left, lengthUnitWidth);

          // same cell, do nothing
          if (current === cx) return;

          if (isMilestone) {
            setTaskSchedule({
              ...taskSchedule,
              cx: current,
              left: current - w / 2,
            });
            return;
          }

          setTaskSchedule({
            ...taskSchedule,
            cx: current,
            left: Math.min(current, x),
            w: Math.abs(current - x) + lengthUnitWidth,
          });
        } else {
          const taskNode = locate(e);
          if (taskNode) {
            const task = api.getTask(getID(taskNode));
            const segNode = locate(e, 'data-segment');
            const barNode = segNode || taskNode;
            const mode = getMoveMode(barNode, point, task);
            barNode.style.cursor = mode && !readonly ? 'col-resize' : 'pointer';
          } else if (unscheduledTasks || placeholderRow) {
            const rowTask = getTaskAtY(clientY);
            const left = getUnitStart(
              clientX - containerRef.current.getBoundingClientRect().left,
              lengthUnitWidth,
            );
            containerRef.current.style.cursor =
              canScheduleTask(rowTask) && isScheduleWorkingDay(rowTask, left)
                ? 'crosshair'
                : '';
          }
        }
      }
    },
    [
      api,
      readonly,
      taskMove,
      taskSchedule,
      lengthUnitWidth,
      totalWidth,
      getMoveMode,
      onSelectLink,
      up,
      unscheduledTasks,
      placeholderRow,
      getTaskAtY,
      canScheduleTask,
      isScheduleWorkingDay,
    ],
  );

  const mousemove = useCallback(
    (e) => {
      move(e, e);
    },
    [move],
  );

  const touchmove = useCallback(
    (e) => {
      if (touched) {
        e.preventDefault();
        move(e, e.touches[0]);
      } else if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    },
    [touched, move],
  );

  const mouseup = useCallback(() => {
    up();
  }, [up]);

  const touchend = useCallback(() => {
    setTouched(null);
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    up();
  }, [up]);

  useEffect(() => {
    window.addEventListener('mouseup', mouseup);
    return () => {
      window.removeEventListener('mouseup', mouseup);
    };
  }, [mouseup]);

  const onDblClick = useCallback(
    (e) => {
      if (!readonly) {
        const id = locateID(e.target);
        if (id && !e.target.classList.contains('wx-link')) {
          const segmentIndex = locateID(e.target, 'data-segment');
          api.exec('show-editor', {
            id,
            ...(segmentIndex !== null && { segmentIndex }),
          });
        }
      }
    },
    [api, readonly],
  );

  const types = ['e2s', 's2s', 'e2e', 's2e'];
  const getLinkType = useCallback((fromStart, toStart) => {
    return types[(fromStart ? 1 : 0) + (toStart ? 0 : 2)];
  }, []);

  const linkedFrom = useMemo(() => {
    if (!linkFrom) return null;
    const out = new Map();
    rLinksValue.forEach((l) => {
      if (l.source !== linkFrom.id) return;
      if (!out.has(l.target)) out.set(l.target, new Set());
      out.get(l.target).add(l.type);
    });
    return out;
  }, [linkFrom, rLinksCounter]);

  const alreadyLinked = useCallback(
    (target, toStart) => {
      if (target === linkFrom.id) return true;
      const type = getLinkType(linkFrom.start, toStart);
      return !!linkedFrom.get(target)?.has(type);
    },
    [linkFrom, linkedFrom, getLinkType],
  );

  const isLinkTarget = useCallback(
    (id, atStart) => {
      if (!linkFrom) return true;
      if (alreadyLinked(id, atStart)) return false;
      const linkValidator = linkValidatorRef.current;
      if (!linkValidator) return true;
      const type = getLinkType(linkFrom.start, atStart);
      return !linkValidator({ source: linkFrom.id, target: id, type });
    },
    [linkFrom, alreadyLinked, getLinkType],
  );

  const removeLinkMarker = useCallback(() => {
    if (linkFrom) {
      setLinkFrom(null);
      linkValidatorRef.current = null;
    }
  }, [linkFrom]);

  const onClick = useCallback(
    (e) => {
      if (ignoreNextClickRef.current) {
        ignoreNextClickRef.current = false;
        return;
      }

      const id = locateID(e.target);
      if (id) {
        const css = e.target.classList;
        if (css.contains('wx-link')) {
          const toStart = css.contains('wx-left');
          if (!linkFrom) {
            linkValidatorRef.current = schedule?.auto
              ? api.getLinkValidator()
              : null;
            setLinkFrom({ id, start: toStart });
            return;
          }

          if (isLinkTarget(id, toStart)) {
            api.exec('add-link', {
              link: {
                source: linkFrom.id,
                target: id,
                type: getLinkType(linkFrom.start, toStart),
              },
            });
          }
        } else if (css.contains('wx-delete-button-icon')) {
          api.exec('delete-link', { id: selectedLinkId });
          setSelectedLinkId(null);
        } else {
          const segmentIndex = locateID(e.target, 'data-segment');
          api.exec('select-task', {
            id,
            toggle: e.ctrlKey || e.metaKey,
            range: e.shiftKey,
            ...(segmentIndex !== null && { segmentIndex }),
          });
        }
      }
      removeLinkMarker();
    },
    [
      api,
      linkFrom,
      rLinksCounter,
      selectedLink,
      selectedLinkId,
      schedule,
      isLinkTarget,
      getLinkType,
      removeLinkMarker,
    ],
  );

  const taskStyle = useCallback((task) => {
    return {
      left: `${task.$x}px`,
      top: `${task.$y}px`,
      width: `${task.$w}px`,
      height: `${task.$h}px`,
      lineHeight: `${task.$h}px`,
    };
  }, []);

  const baselineStyle = useCallback((task) => {
    return {
      left: `${task.$x_base}px`,
      top: `${task.$y_base}px`,
      width: `${task.$w_base}px`,
      height: `${task.$h_base}px`,
    };
  }, []);

  const slackStyle = useCallback((task) => {
    return {
      left: `${task.$x_slack}px`,
      top: `${task.$y}px`,
      width: `${Math.max(task.$w_slack, 0)}px`,
      height: `${task.$h}px`,
    };
  }, []);

  const contextmenu = useCallback(
    (ev) => {
      if (touched || touchTimerRef.current) {
        ev.preventDefault();
        return false;
      }
    },
    [touched],
  );

  const taskTypeIds = useMemo(
    () => taskTypesValue.map((t) => t.id),
    [taskTypesValue],
  );

  const taskTypeCss = useCallback(
    (type) => {
      let css = taskTypeIds.includes(type) ? type : 'task';
      if (!['task', 'milestone', 'summary'].includes(type)) {
        css = `task ${css}`;
      }
      return css;
    },
    [taskTypeIds],
  );

  const forward = useCallback(
    (ev) => {
      api.exec(ev.action, ev.data);
    },
    [api],
  );

  const isTaskCritical = useCallback(
    (task) => {
      return criticalPath && task.critical;
    },
    [criticalPath],
  );

  return (
    <div
      className="wx-GKbcLEGA wx-bars"
      ref={containerRef}
      onContextMenu={contextmenu}
      onMouseDown={mousedown}
      onMouseMove={mousemove}
      onTouchStart={touchstart}
      onTouchMove={touchmove}
      onTouchEnd={touchend}
      onClick={onClick}
      onDoubleClick={onDblClick}
      onDragStart={(e) => {
        e.preventDefault();
        return false;
      }}
    >
      {slack
        ? tasks.map((task) =>
            task.$visibleSlack ? (
              <div
                key={task.id}
                className={`wx-GKbcLEGA wx-slack wx-slack-${task.type}`}
                style={slackStyle(task)}
              ></div>
            ) : null,
          )
        : null}
      <Links
        onSelectLink={onSelectLink}
        selectedLink={selectedLink}
        readonly={readonly}
      />
      {taskSchedule ? (
        <div
          className={`wx-GKbcLEGA wx-bar wx-${taskSchedule.task?.type || 'task'} wx-schedule-task`}
          style={scheduleStyle(taskSchedule)}
        ></div>
      ) : null}
      {tasks.map((task) => {
        const hasDeadline =
          deadlines && task.deadline && typeof task.$x_deadline === 'number';
        const hasConstraint =
          task.constraint && typeof task.$x_constraint === 'number';
        if (
          task.$skip &&
          task.$skip_baseline &&
          !(rollups && rRollups?.[task.id]) &&
          !hasDeadline &&
          !hasConstraint
        )
          return null;
        const barClass =
          `wx-bar wx-${taskTypeCss(task.type)}` +
          (touched && taskMove && task.id === taskMove.id ? ' wx-touch' : '') +
          (linkFrom && linkFrom.id === task.id ? ' wx-selected' : '') +
          (isTaskCritical(task) ? ' wx-critical' : '') +
          (task.$reorder ? ' wx-reorder-task' : '') +
          (splitTasks && task.segments ? ' wx-split' : '') +
          (schedule?.auto && task.manual ? ' wx-manual' : '') +
          (inactiveTasks && task.inactive ? ' wx-inactive' : '') +
          (task.$noWorkingTime ? ' wx-no-working-time' : '');
        const leftLinkClass =
          'wx-link wx-left' +
          (linkFrom ? ' wx-visible' : '') +
          (isLinkTarget(task.id, true) ? ' wx-target' : '') +
          (linkFrom && linkFrom.id === task.id && linkFrom.start
            ? ' wx-selected'
            : '') +
          (isTaskCritical(task) ? ' wx-critical' : '');
        const rightLinkClass =
          'wx-link wx-right' +
          (linkFrom ? ' wx-visible' : '') +
          (isLinkTarget(task.id, false) ? ' wx-target' : '') +
          (linkFrom && linkFrom.id === task.id && !linkFrom.start
            ? ' wx-selected'
            : '') +
          (isTaskCritical(task) ? ' wx-critical' : '');
        return (
          <Fragment key={task.id}>
            {!task.$skip && (
              <div
                className={'wx-GKbcLEGA ' + barClass}
                style={taskStyle(task)}
                data-id={setID(task.id)}
                data-task-id={setID(task.id)}
                tabIndex={focused === task.id ? 0 : -1}
              >
                {!readonly && !hasDuplicatedIds ? (
                  task.id === selectedLink?.target &&
                  selectedLink?.type[2] === 's' ? (
                    <Button
                      type="danger"
                      css="wx-left wx-delete-button wx-delete-link"
                    >
                      <i className="wxi-close wx-delete-button-icon"></i>
                    </Button>
                  ) : (
                    <div className={'wx-GKbcLEGA ' + leftLinkClass}>
                      <div className="wx-GKbcLEGA wx-inner"></div>
                    </div>
                  )
                ) : null}

                {task.type !== 'milestone' ? (
                  <>
                    {task.progress && !(splitTasks && task.segments) ? (
                      <div className="wx-GKbcLEGA wx-progress-wrapper">
                        <div
                          className="wx-GKbcLEGA wx-progress-percent"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    ) : null}
                    {!readonly &&
                    !(splitTasks && task.segments) &&
                    !(task.type === 'summary' && summary?.autoProgress) ? (
                      <div
                        className="wx-GKbcLEGA wx-progress-marker"
                        style={{ left: `calc(${task.progress}% - 10px)` }}
                      >
                        {task.progress}
                      </div>
                    ) : null}
                    {TaskTemplate ? (
                      <TaskTemplate data={task} api={api} onAction={forward} />
                    ) : splitTasks && task.segments ? (
                      <BarSegments task={task} type={taskTypeCss(task.type)} />
                    ) : (
                      <div className="wx-GKbcLEGA wx-content">
                        {task.text || ''}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="wx-GKbcLEGA wx-content"></div>
                    {TaskTemplate ? (
                      <TaskTemplate data={task} api={api} onAction={forward} />
                    ) : (
                      <div className="wx-GKbcLEGA wx-text-out">{task.text}</div>
                    )}
                  </>
                )}

                {!readonly && !hasDuplicatedIds ? (
                  task.id === selectedLink?.target &&
                  selectedLink?.type[2] === 'e' ? (
                    <Button
                      type="danger"
                      css="wx-right wx-delete-button wx-delete-link"
                    >
                      <i className="wxi-close wx-delete-button-icon"></i>
                    </Button>
                  ) : (
                    <div className={'wx-GKbcLEGA ' + rightLinkClass}>
                      <div className="wx-GKbcLEGA wx-inner"></div>
                    </div>
                  )
                ) : null}
              </div>
            )}
            {rollups && rRollups?.[task.id]
              ? rRollups[task.id].map((rollup, i) => (
                  <Rollups key={i} rollup={rollup} parent={task} />
                ))
              : null}
            {baselinesValue && !task.$skip_baseline ? (
              <div
                className={
                  'wx-GKbcLEGA wx-baseline' +
                  (task.type === 'milestone' ? ' wx-milestone' : '')
                }
                style={baselineStyle(task)}
              ></div>
            ) : null}
            {hasDeadline ? (
              <div
                className={
                  'wx-GKbcLEGA wx-deadline' +
                  (task.$overdue ? ' wx-overdue' : '')
                }
                style={deadlineStyle(task)}
              >
                <i className="wx-GKbcLEGA wxi-flag" data-deadline={task.id}></i>
              </div>
            ) : null}
            {hasConstraint ? (
              <div
                className={
                  `wx-GKbcLEGA wx-constraint wx-constraint-${task.constraint.type}` +
                  (constraintOpensRight(task.constraint.type)
                    ? ' wx-start'
                    : ' wx-end') +
                  (constraintViolated?.has(task.$id || task.id)
                    ? ' wx-violated'
                    : '') +
                  (isConstraintCompact(task) ? ' wx-compact' : '')
                }
                style={constraintStyle(task)}
                data-constraint-id={setID(task.id)}
              >
                <span className="wx-GKbcLEGA wx-constraint-badge">
                  {task.constraint.type.toUpperCase()}
                </span>
                <span className="wx-GKbcLEGA wx-constraint-line"></span>
                {!isMustConstraint(task.constraint.type) ? (
                  <span
                    className="wx-GKbcLEGA wx-constraint-arrow"
                    aria-hidden="true"
                  ></span>
                ) : null}
              </div>
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}

export default Bars;
