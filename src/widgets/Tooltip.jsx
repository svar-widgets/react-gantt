import { useState, useEffect, useRef } from 'react';
import { locateID, getID } from '@svar-ui/lib-dom';
import './Tooltip.css';

function Tooltip(props) {
  const { api, content: Content, children } = props;

  const areaRef = useRef(null);
  const tooltipNodeRef = useRef(null);

  const [areaCoords, setAreaCoords] = useState({});
  const [contentProps, setContentProps] = useState({});
  const [pos, setPos] = useState({});
  const posRef = useRef(pos);
  posRef.current = pos;

  function findAttribute(node) {
    const trg = node;
    while (node) {
      if (node.getAttribute) {
        const id = getID(node, 'data-tooltip-id');
        const at = getID(node, 'data-tooltip-at');
        const tooltip = node.getAttribute('data-tooltip');
        if (id || tooltip) {
          const segment = locateID(trg, 'data-segment');
          return { id, tooltip, target: node, at, segment };
        }
      }
      node = node.parentNode;
    }

    return { id: null, tooltip: null, target: null, at: null, segment: null };
  }

  useEffect(() => {
    const tooltipNode = tooltipNodeRef.current;
    const currentPos = posRef.current;
    if (tooltipNode && currentPos && (currentPos.text || Content)) {
      const tooltipCoords = tooltipNode.getBoundingClientRect();

      let updated = false;
      let newLeft = currentPos.left;
      let newTop = currentPos.top;

      if (tooltipCoords.right >= areaCoords.right) {
        newLeft = areaCoords.width - tooltipCoords.width - 5;
        updated = true;
      }
      if (tooltipCoords.bottom >= areaCoords.bottom) {
        newTop = currentPos.top - (tooltipCoords.bottom - areaCoords.bottom + 2);
        updated = true;
      }

      if (updated) {
        setPos((prev) => {
          if (!prev) return prev;
          return { ...prev, left: newLeft, top: newTop };
        });
      }
    }
  }, [areaCoords, Content]);

  const timerRef = useRef(null);
  const TIMEOUT = 300;
  const debounce = (code) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      code();
    }, TIMEOUT);
  };

  function move(e) {
    let { id, tooltip, target, at, segment } = findAttribute(e.target);
    setPos(null);
    setContentProps({});

    if (!tooltip) {
      if (!id) {
        clearTimeout(timerRef.current);
        return;
      } else {
        tooltip = getTaskText(id, segment);
      }
    }

    const clientX = e.clientX;

    debounce(() => {
      if (id) {
        const props = { data: getTaskObj(id) };
        if (segment != null) props.segmentIndex = segment;
        setContentProps(props);
      }

      const targetCoords = target.getBoundingClientRect();
      const areaEl = areaRef.current;
      const areaRect = areaEl
        ? areaEl.getBoundingClientRect()
        : { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };

      let top, left;
      if (at === 'left') {
        top = targetCoords.top + 5 - areaRect.top;
        left = targetCoords.right + 5 - areaRect.left;
      } else {
        top = targetCoords.top + targetCoords.height - areaRect.top;
        left = clientX - areaRect.left;
      }

      setAreaCoords(areaRect);
      setPos({ top, left, text: tooltip });
    });
  }

  function getTaskObj(id) {
    return api?.getTask(id) || null;
  }

  function getTaskText(id, segment) {
    const task = getTaskObj(id);
    if (segment !== null && task?.segments)
      return task.segments[segment]?.text || '';
    return task?.text || '';
  }

  return (
    <div
      className="wx-KG0Lwsqo wx-tooltip-area"
      ref={areaRef}
      onMouseMove={move}
    >
      {pos && (pos.text || Content) ? (
        <div
          className="wx-KG0Lwsqo wx-gantt-tooltip"
          ref={tooltipNodeRef}
          style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
        >
          {Content ? (
            <Content {...contentProps} />
          ) : pos.text ? (
            <div className="wx-KG0Lwsqo wx-gantt-tooltip-text">{pos.text}</div>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  );
}

export default Tooltip;
