import "./styles.css";

import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";

const jsonQuery = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
        ],
      },
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"],
      },
    },
    {
      code: "Tiedot",
      selection: {
        filter: "item",
        values: ["vaesto"],
      },
    },
  ],
  response: {
    format: "json-stat2",
  },
};

const municipalityInput = document.querySelector("#input-area");
const btnSearchByMunicipality = document.querySelector("#submit-data");
const btnDataPrediction = document.querySelector("#add-data");
const btnNavigation = document.querySelector("#navigation");

let populationData = undefined;
let municipalityData = undefined;
let municipalityCodes = {};

const loadPopulationData = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQuery),
  });

  if (!res.ok) {
    console.log("error loading page");
    return;
  }

  const data = await res.json();
  //console.log(data)
  return data;
};

const loadMunicipalityData = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url);

  if (!res.ok) {
    console.log("error loading page");
    return;
  }

  const data = await res.json();
  //console.log(data)
  return data;
};

const initApp = async () => {
  populationData = await loadPopulationData();
  municipalityData = await loadMunicipalityData();

  /*
  Lets make new data structure to olh key values for differnt municipalites in finland 
  filling municipalityCodes
  */
  for (let i = 0; i < 310; i++) {
    municipalityCodes[
      municipalityData.variables[1].valueTexts[i].toLowerCase()
    ] = municipalityData.variables[1].values[i];
  }
  //console.log(municipalityCodes)
  //console.log(Object.values(municipalityCodes).length)
  buildChart();
};

btnSearchByMunicipality.addEventListener("click", async (e) => {
  e.preventDefault();
  //console.log(municipalityCodes)

  let searchTerm = municipalityInput.value.toLowerCase();
  if (
    !municipalityCodes[searchTerm] ||
    jsonQuery["query"][1].selection.values.includes(
      municipalityCodes[searchTerm]
    )
  ) {
    console.log("debug: municipality's name is wrong or data already fetched");
    return;
  }

  // update query and fetch new data, because municapility
  jsonQuery["query"][1].selection.values = [];
  jsonQuery["query"][1].selection.values.push(municipalityCodes[searchTerm]);
  //console.log(jsonQuery)
  populationData = await loadPopulationData();
  //console.log(municipalityCodes[searchTerm])

  buildChart();
});

btnNavigation.addEventListener("click", () => {
  window.location.replace("/newchart.html");
});

const buildChart = () => {
  let years = Object.values(populationData.dimension.Vuosi.category.label);
  let population = populationData.value;
  //Object.values(populationDataata.dimension.Vuosi.category.label)

  //console.log(years)
  //console.log(population)

  const data = {
    labels: years,
    datasets: [
      {
        name: "Population data",
        values: population,
      },
    ],
  };

  const chart = new Chart("#chart", {
    // or a DOM element,
    // new Chart() in case of ES6 module with above usage
    title: "Population Data",
    data: data,
    type: "line", // or 'bar', 'line', 'scatter', 'pie', 'percentage'
    height: 450,
    colors: ["#eb5146"],
  });
};

btnDataPrediction.addEventListener("click", () => {
  const meanFunction = (arr) => {
    /*
      Mean of array [5, 2, 4, -1] would be: 
      ((2−5)+(4−2)+((−1)−4))/3+(−1)=(2−3−5)/3−1=(−6)/3−1=−3 
    */
    let mean = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      mean += arr[i + 1] - arr[i];
    }
    mean /= arr.length - 1;
    mean += arr[arr.length - 1];

    return mean;
  };

  // first we add new value of mean to chart data according to given formula that is
  // calculated in function above meanFunction
  populationData.value.push(meanFunction(populationData.value));
  // also lets add new year according to lastest year given by api
  // latest year was 2021 when doing this course submission
  let latestYear = parseInt(
    Object.values(populationData.dimension.Vuosi.category.label)[
      Object.values(populationData.dimension.Vuosi.category.label).length - 1
    ]
  );
  populationData.dimension.Vuosi.category.label[latestYear + 1] = (
    latestYear + 1
  ).toString();
  //console.log(populationData.dimension.Vuosi.category.label)
  buildChart();
});

initApp();
