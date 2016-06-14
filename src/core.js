
// all chart levels
export const makeTreeFromHuc8Data = (data) => {
  var catUnitId,
      tree = {
        ID : 'HUC8 ' + data[0].properties.geography_match_id,
        children : [],
      },
      huc12s = new Map();
  data.forEach( (d) => {
    d = d.properties;
    if (!huc12s.has(d.ID)) {
      huc12s.set(d.ID, data.filter((e) => {
        return d.ID === e.properties.ID;
      }));
    }
  });
  huc12s.forEach((arr, id) => {
    // TODO: there appear to be some HUC12s with chart data missing.
    // I've found one with a missing feature for chart_level 1
    // and also missing an entire subtree for a category at chart_level 2
    if (arr.length === 16) tree.children.push(makeTreeFromHuc12Data(arr, id));
  });
  return tree;
}

export const makeTreeFromHuc12Data = (data, id) => {
  var tree = data.filter( (d) => d.properties.chart_level === 1)[0].properties;
  tree.children = [];
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
