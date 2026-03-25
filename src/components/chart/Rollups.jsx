function Rollups(props) {
  const { rollup, parent } = props;

  return (
    <div
      data-tooltip-id={rollup.id}
      className={`wx-GKbcLEGA wx-rollup wx-${rollup.type}-rollup`}
      style={{
        left: `${rollup.$x_rollup}px`,
        top: `${parent.$y + parent.$h + rollup.$y_rollup_relative}px`,
        width: `${rollup.$w_rollup}px`,
        height: `${rollup.$h_rollup}px`,
      }}
    ></div>
  );
}

export default Rollups;
