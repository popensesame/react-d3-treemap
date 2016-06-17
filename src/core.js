
const DECIMAL_PRECISION = 3;

// Build a tree from a list of chart data for all HUC12s in a single HUC8
// An example query's WHERE field:
// geography_match_id='03020104' and chart_value is not null
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
      huc12s.set(
        d.ID,
        data.filter((e) => d.ID === e.properties.ID).map((f) => f.properties)
      );
    }
  });
  huc12s.forEach((arr, id) => {
    if (arr.length === 16) tree.children.push(makeTreeFromHuc12Data(arr));
  });
  return tree;
}

// Build a tree from a list of chart data for a single HUC12
// Chart values are rounded and zero values are not used.
export const makeTreeFromHuc12Data = (data) => {
  if (data[0].properties) data = data.map( (d) => d.properties);
  var tree = data.filter( (d) => d.chart_level === 1)[0];
  console.log(tree);
  tree.children = [];
  var chart_levels = new Map();
  for (var i=2; i<=4; i++) {
    chart_levels.set(i, data.filter( (d) => {
      d.chart_value = (1*d.chart_value).toFixed(DECIMAL_PRECISION);
      return d.chart_level === i && d.chart_value > 0;
    }));
  }
  chart_levels.get(2).forEach((d) => {
    tree.children.push(d);
  });
  chart_levels.get(3).forEach((d) => {
    tree.children.forEach((e) => {
      if (d.chart_matchid === e.chart_id) {
        if (!e.children) e.children = [];
        e.children.push(d);
      }
    })
  });
  chart_levels.get(4).forEach((d) => {
    tree.children.forEach((e) => {
      if (e.children) {
        e.children.forEach((f) => {
          if (d.chart_matchid === f.chart_id) {
            if (!f.children) f.children = [];
            f.children.push(d);
          }
        });
      }
    });
  });
  return tree;
}
