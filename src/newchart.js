import "./styles.css";

import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";

let jsonQuery = undefined;
let birthData = undefined;
let deathData = undefined;
let municipalityName = undefined;

const loadData = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQuery),
  });

  if (!res.ok) {
    return;
  }

  const data = await res.json();
  //console.log(data)
  return data;
};

const initApp = async () => {
  // update municipalitys to correct one, choise on a previous view of index.html
  let urlParams = new URLSearchParams(window.location.search);
  jsonQuery = JSON.parse(urlParams.get("query"));
  municipalityName = JSON.parse(urlParams.get("name"));

  // fetching is based on a global variable jsonQuery, which we update for each call if needed
  // first we fetch birth data for a municapality
  jsonQuery["query"][2].selection.values[0] = "vm01";
  birthData = await loadData();

  // now update to reflect next query, which is death in a municipality
  jsonQuery["query"][2].selection.values[0] = "vm11";
  deathData = await loadData();

  buildChart();
};

const buildChart = () => {
  let years = Object.values(birthData.dimension.Vuosi.category.label);
  let births = birthData.value;
  let deaths = deathData.value;

  const data = {
    labels: years,
    datasets: [
      {
        name: "Births",
        values: births,
      },
      {
        name: "Deaths",
        values: deaths,
      },
    ],
  };

  const chart = new Chart("#chart", {
    title: `Births and deaths in ${municipalityName}`,
    data: data,
    type: "bar", // or 'bar', 'line', 'scatter', 'pie', 'percentage'
    height: 450,
    colors: ["#63d0ff", "#363636"],
  });
};

initApp();
