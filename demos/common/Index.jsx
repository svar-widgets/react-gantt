import { useState, useCallback } from 'react';
import { HashRouter, NavLink, useNavigate } from 'react-router-dom';
import { Willow } from '@svar-ui/react-core';

import Router from './Router';
import { links } from '../routes';
import { GitHubLogoIcon, LogoIcon } from '../assets/icons';
import './Index.css';

function DemoExplorerContent({
  productTag,
  publicName,
  skins,
  Globals,
  Button,
  Segmented,
}) {
  const navigate = useNavigate();
  const [skin, setSkin] = useState(skins[0].id);
  const [show, setShow] = useState(true);

  const currentPath = window.location.hash.slice(1);
  const parts = currentPath.split('/');
  const currentPage = `/${parts[1]}/:skin`;
  const matched = links.find((a) => a[0] === currentPage);
  const title = matched ? matched[1] : '';
  const baseLink =
    'https://github.com/svar-widgets/react-' +
    productTag +
    '/tree/main/demos/cases/';

  const name = matched ? (matched[3] || matched[1]) : '';
  const githubLink = `${baseLink}${name}.jsx`;

  const handleRouteChange = useCallback((path) => {
    const parts = path.split('/');
    const newSkin = parts[2];
    setSkin(newSkin);
  }, []);

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
    <div className={`wx-demos wx-willow-theme layout ${show ? 'active' : ''}`}>
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
                href={`https://svar.dev/react/gantt/`}
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
              <NavLink
                key={data[0]}
                to={data[0].replace(':skin', skin)}
                className={({ isActive }) =>
                  `wx-demos demo ${isActive ? 'active' : ''}`
                }
              >
                {data[1]}
                {data[4] && data[4].pro && <span className="pro">PRO</span>}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="wx-demos page-content">
        <div className="wx-demos page-content-header">
          <div className="wx-demos header-title-box">
            {!show && (
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
              />
            </div>
            <div className="wx-demos btn-box">
              <a href={githubLink} target="_blank" rel="noopener noreferrer">
                <Button type="secondary" css="toggle-btn">
                  <img src={GitHubLogoIcon} alt="GitHub icon" />
                  See code on GitHub
                </Button>
              </a>
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
              <SkinComponent>
                <Router skin={skin} onRouteChange={handleRouteChange} />
              </SkinComponent>
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
