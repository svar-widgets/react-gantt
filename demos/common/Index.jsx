import { useState, useCallback, useEffect } from 'react';
import { HashRouter, useNavigate } from 'react-router-dom';
import { Willow } from '@svar-ui/react-core';

import Router from './Router';
import Link from './Link';
import { links } from '../routes';
import { GitHubLogoIcon, LogoIcon } from '../assets/icons';
import './Index.css';

const MOBILE_BREAKPOINT = 767;

function DemoExplorerContent({
  productTag,
  productLink,
  publicName,
  skins,
  Globals,
  Button,
  Segmented,
}) {
  const navigate = useNavigate();
  const [skin, setSkin] = useState(skins[0].id);
  const [title, setTitle] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [show, setShow] = useState(true);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);

  const isMobileView = innerWidth <= MOBILE_BREAKPOINT;

  const baseLink =
    'https://github.com/svar-widgets/react-' +
    productTag +
    '/tree/main/demos/cases/';

  useEffect(() => {
    const handleResize = () => setInnerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileView && title) {
      setShow(false);
    }
  }, [isMobileView, title]);

  const handleRouteChange = useCallback(
    (path) => {
      const parts = path.split('/');
      const page = parts[1];
      const newSkin = parts[2];
      setSkin(newSkin);

      const targetPage = `/${page}/:skin`;
      const matched = links.find((a) => a[0] === targetPage);
      if (matched) {
        setTitle(matched[1]);
        const name = matched[3] || matched[1];
        setGithubLink(`${baseLink}${name}.jsx`);
      }
    },
    [],
  );

  const handleSkinChange = ({ value }) => {
    setSkin(value);
    const currentPath = window.location.hash.slice(1);
    const parts = currentPath.split('/');
    if (parts[1]) {
      navigate(`/${parts[1]}/${value}`);
    }
  };

  const toggleSidebar = () => {
    setShow(!show);
  };

  const SkinComponent = skins.find((s) => s.id === skin).Component;

  return (
    <div
      className={`wx-demos wx-willow-theme layout ${show ? 'active' : ''}${isMobileView ? ' narrow' : ''}`}
    >
      <div
        className={`wx-demos sidebar ${show ? 'active' : ''}`}
        role="tabpanel"
      >
        <div className="wx-demos sidebar-content">
          <div className="wx-demos sidebar-header">
            <div className="wx-demos box-title">
              <a
                href="https://svar.dev/react/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={LogoIcon} alt="Logo icon" className="box-title-img" />
              </a>
              <div className="wx-demos separator"></div>
              <a
                href={`https://svar.dev/react/${productLink}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <h1 className="wx-demos title">React {publicName}</h1>
              </a>
            </div>
            <div className="wx-demos btn-box">
              <Button
                type="secondary"
                icon="wxi-angle-left"
                css="toggle-btn"
                onClick={toggleSidebar}
              ></Button>
            </div>
          </div>
          <div className="wx-demos box-links">
            {links.map((data) => (
              <Link
                key={data[0]}
                data={data}
                skin={skin}
                onClick={() => isMobileView && setShow(false)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="wx-demos page-content">
        <div className="wx-demos page-header">
          {isMobileView && (
            <div className="wx-demos header-back-btn">
              <div className="wx-demos btn-box">
                <Button
                  icon="wxi-angle-left"
                  css="toggle-btn"
                  onClick={toggleSidebar}
                  type="secondary"
                >
                  Back to list
                </Button>
              </div>
            </div>
          )}
          <div className="wx-demos page-content-header">
            <div className="wx-demos header-title-box">
              {!show && !isMobileView && (
                <div className="wx-demos btn-box">
                  <Button
                    type="secondary"
                    icon="wxi-angle-right"
                    css="toggle-btn"
                    onClick={toggleSidebar}
                  />
                </div>
              )}
              <div className="wx-demos hint">{title}</div>
            </div>
            <div className="wx-demos header-actions-container">
              <div className="wx-demos segmented-box">
                <Segmented
                  value={skin}
                  options={skins}
                  css="segmented-themes"
                  onChange={handleSkinChange}
                >
                  {({ option }) => {
                    const Icon = option.icon;
                    return (
                      <>
                        {Icon && <Icon />}
                        {!isMobileView && (
                          <span style={{ marginLeft: '4px' }}>{option.label}</span>
                        )}
                      </>
                    );
                  }}
                </Segmented>
              </div>
              <div className="wx-demos btn-box">
                <a href={githubLink} target="_blank" rel="noopener noreferrer">
                  <Button type="secondary" css="toggle-btn link-btn">
                    <div>
                      <img src={GitHubLogoIcon} alt="GitHub icon" />
                    </div>
                    {!isMobileView && <span>See code on GitHub</span>}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div
          className="wx-demos wrapper-content"
          onClick={() => setShow(false)}
          role="none"
        >
          <div
            className={`wx-demos content wx-${skin}-theme`}
            role="none"
            data-wx-portal-root="true"
          >
            <Globals>
              <SkinComponent/>
              <Router skin={skin} onRouteChange={handleRouteChange} />
            </Globals>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoExplorer(props) {
  return (
    <>
      <Willow />
      <HashRouter>
        <DemoExplorerContent {...props} />
      </HashRouter>
    </>
  );
}
