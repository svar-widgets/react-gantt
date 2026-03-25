import { useState, useEffect, useMemo, useContext } from 'react';
import { context } from '@svar-ui/react-core';
import {
	FilterQuery,
	createFilter,
	getQueryString,
	getOptionsMap,
} from '@svar-ui/react-filter';
import { Gantt } from '../../src/index.js';
import { getData } from '../data';
import './GanttFilterQuery.css';

function GanttFilterQuery({ skinSettings }) {
  const helpers = useContext(context.helpers);

  const { tasks, links } = useMemo(() => getData(), []);

  const [textValue, setTextValue] = useState('Progress: < 20');
  const [api, setApi] = useState();
  const [filter, setFilter] = useState();

  useEffect(() => {
    if (api && filter !== undefined) api.exec('filter-tasks', { filter });
  }, [api, filter]);

  const options = useMemo(() => getOptionsMap(tasks), [tasks]);

  const fields = [
    { id: 'text', label: 'Text', type: 'text' },
    { id: 'details', label: 'Description', type: 'text' },
    { id: 'type', label: 'Type', type: 'text' },
    { id: 'duration', label: 'Duration', type: 'number' },
    { id: 'start', label: 'Start Date', type: 'date' },
    { id: 'end', label: 'End Date', type: 'date' },
    { id: 'progress', label: 'Progress', type: 'number' },
  ];

  async function handleFilter({ value, error, text, startProgress, endProgress }) {
    if (text) {
      error = null;
      try {
        startProgress();
        value = await text2filter(text, fields);
        setTextValue(value ? getQueryString(value).query : '');
      } catch (e) {
        error = e;
      } finally {
        endProgress();
      }
    }

    if (error) {
      helpers.showNotice({
        text: error.message,
        type: 'danger',
      });

      if (error.code !== 'NO_DATA') return;
    }
    setFilter(() => createFilter(value, {}, fields));
  }

  const url =
    'https://master--svar-filter-natural-text--dev.webix.io/text-to-json';

  async function text2filter(text, fields) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ text, fields }),
    });
    const json = await response.json();
    if (!response.ok) {
      helpers.showNotice({
        text: json.error || 'Request failed',
        type: 'danger',
      });
      return null;
    }
    return json;
  }

  return (
    <div className="wx-aaaHR5Nn" style={{ padding: '20px' }}>
      <h4>Filter Gantt tasks with FilterQuery in AI-powered mode</h4>
      <FilterQuery
        value={textValue}
        placeholder="e.g., Text: contains test or Duration: >5"
        fields={fields}
        options={options}
        onChange={handleFilter}
      />
      <p className="hint wx-aaaHR5Nn">
        Type filter conditions using query syntax or natural language. Examples:
      </p>
      <ul className="examples wx-aaaHR5Nn">
        <li className="wx-aaaHR5Nn">Duration: &gt;10</li>
        <li className="wx-aaaHR5Nn">StartDate: &gt;= 2026-03-01</li>
        <li className="wx-aaaHR5Nn">Text: contains test</li>
        <li className="wx-aaaHR5Nn">Almost complete</li>
      </ul>
      <div className="wx-aaaHR5Nn" style={{ height: '550px', border: 'var(--wx-gantt-border)' }}>
        <Gantt
          {...skinSettings}
          tasks={tasks}
          links={links}
          init={setApi}
        />
      </div>
    </div>
  );
}

export default GanttFilterQuery;
