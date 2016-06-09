
// chart level 1 only
export const makeTreeFromHuc8Data = (data) => {
  var catUnitId,
      tree = { chart_level_label : data[0].geography_match_id, children : [] };
  data.forEach( (d) => {
    d = d.properties;
    tree.children.push(d);
  });
  return tree;
}

export const makeTreeFromHuc12Data = (data) => {
  var tree = {
    chart_level_label : '[Baseline] HUC12 ID: ' + data[0].properties.ID,
    children : []
  };
  var parentChartId = 1;
  var parent;
  var chartLevel = 0;
  var subroot = tree;
  var list = subroot.children;
  var chart_levels = new Map();
  for (var i=2; i<=4; i++) {
    chart_levels.set(i, data.filter( (d) => {
      return d.properties.chart_level === i && d.properties.chart_value > 0;
    }));
  }
  chart_levels.get(2).forEach((d) => {
    d = d.properties;
    tree.children.push(d);
  });
  chart_levels.get(3).forEach((d) => {
    d = d.properties;
    tree.children.forEach((e) => {
      if (d.chart_matchid === e.chart_id) {
        if (!e.children) e.children = [];
        e.children.push(d);
      }
    })
  });
  chart_levels.get(4).forEach((d) => {
    d = d.properties;
    tree.children.forEach((e) => {
      e.children.forEach((f) => {
        if (d.chart_matchid === f.chart_id) {
          if (!f.children) f.children = [];
          f.children.push(d);
        }
      });
    });
  });
  return tree;
}
