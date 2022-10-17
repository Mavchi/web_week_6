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
                values: ["vm01"],
            },
        },
    ],
    response: {
        format: "json-stat2",
    },
};

let birthData = undefined
let deathData = undefined
let municipalityName = undefined

const loadData = async () => {
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
    console.log(data)
    return data;
}

const initApp = async () => {
    // update municipalitys to correct one, choise on a previous view of index.html
    let urlParams = new URLSearchParams(window.location.search)
    jsonQuery["query"][1].selection.values[0] = JSON.parse(urlParams.get("code"))
    municipalityName = JSON.parse(urlParams.get("name"))

    console.log(jsonQuery["query"][1].selection.values[0])
    console.log(municipalityName)

    // fetching is based on a global variable jsonQuery, which we update for each call if needed
    // first we fetch birth data for a municapality
    birthData = await loadData()

    // now update to reflect next query, which is death in a municipality
    jsonQuery["query"][2].selection.values[0] = "vm11"
    deathData = await loadData()

    buildChart()
}

const buildChart = () => {
    let years = Object.values(birthData.dimension.Vuosi.category.label)
    let births = birthData.value
    let deaths = deathData.value

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
            }
        ],
    };

    const chart = new Chart("#chart", {
        title: `Births and deaths in ${municipalityName}`,
        data: data,
        type: "bar", // or 'bar', 'line', 'scatter', 'pie', 'percentage'
        height: 450,
        colors: ["#63d0ff", "#363636"],
    });
}

initApp()