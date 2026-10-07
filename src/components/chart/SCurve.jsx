import { Fragment, useContext } from 'react';
import { useStore } from '@svar-ui/lib-react';
import storeContext from '../../context';
import './SCurve.css';

function lineCss(line) {
  return line.css || `wx-scurve-${line.type}-${line.metric}`;
}

function SCurve() {
  const api = useContext(storeContext);
  const sCurvePoints = useStore(api, '_sCurvePoints');
  const chartHeight = useStore(api, '_chartHeight');
  const scales = useStore(api, '_scales');
  const scrollTop = useStore(api, 'scrollTop');

  if (!sCurvePoints?.length) return null;

  return (
    <svg
      className="wx-aabFMYCJ wx-scurve"
      style={{ top: `${scrollTop}px` }}
      width={scales.width}
      height={chartHeight}
    >
      {sCurvePoints.map((line) => (
        <Fragment key={line.line}>
          <polyline
            className={`wx-aabFMYCJ wx-scurve-line ${lineCss(line)}`}
            points={line.path}
          />
          {line.points.map((p) => (
            <g
              key={p.index}
              className="wx-aabFMYCJ wx-scurve-point"
              data-scurve-line={line.line}
              data-scurve-index={p.index}
            >
              <circle
                className="wx-aabFMYCJ wx-scurve-hit"
                cx={p.x}
                cy={p.y}
                r="10"
              />
              <circle
                className={`wx-aabFMYCJ wx-scurve-dot ${lineCss(line)}`}
                cx={p.x}
                cy={p.y}
                r="4"
              />
            </g>
          ))}
        </Fragment>
      ))}
    </svg>
  );
}

export default SCurve;
