import { useCallback, useContext, useEffect, useRef } from 'react';
import storeContext from '../../context';
import { useStore } from '@svar-ui/lib-react';
import { setID } from '@svar-ui/lib-dom';
import './Links.css';

export default function Links({ onSelectLink, selectedLink, readonly }) {
  const api = useContext(storeContext);
  const links = useStore(api, '_links');
  const criticalPath = useStore(api, 'criticalPath');

  const selectedLineRef = useRef(null);

  const onClickOutside = useCallback(
    (event) => {
      const css = event?.target?.classList;
      if (!css?.contains('wx-line') && !css?.contains('wx-delete-button')) {
        onSelectLink(null);
      }
    },
    [onSelectLink],
  );

  useEffect(() => {
    if (!readonly && selectedLink && selectedLineRef.current) {
      const handler = (event) => {
        if (
          selectedLineRef.current &&
          !selectedLineRef.current.contains(event.target)
        ) {
          onClickOutside(event);
        }
      };
      document.addEventListener('click', handler);
      return () => {
        document.removeEventListener('click', handler);
      };
    }
  }, [readonly, selectedLink, onClickOutside]);

  return (
    <svg className="wx-dkx3NwEn wx-links">
      {(links || []).map((link) => {
        const className =
          'wx-dkx3NwEn wx-line' +
          (criticalPath && link.critical ? ' wx-critical' : '') +
          (!readonly ? ' wx-line-selectable' : '');
        return (
          <polyline
            className={className}
            points={link.$p}
            key={link.id}
            onClick={() => !readonly && onSelectLink(link.id)}
            data-link-id={setID(link.id)}
          />
        );
      })}
      {!readonly && selectedLink && (
        <polyline
          ref={selectedLineRef}
          className="wx-dkx3NwEn wx-line wx-line-selected wx-line-selectable wx-delete-link"
          points={selectedLink.$p}
        />
      )}
    </svg>
  );
}
