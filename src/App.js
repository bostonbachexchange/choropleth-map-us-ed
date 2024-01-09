import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import './App.css';

function App() {
  const [countyData, setCountyData] = useState();
  const [educationData, setEducationData] = useState();
  const legendColors = ["#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c"];
  const legendLabels = ["3%", "12%", "21%", "30%", "39%", "48%", "57%", "66%"];
  
  const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"

  function drawSvg() {
    d3.selectAll("svg").remove()
    const width = 1000;
    const height = 800;

    const tooltip = d3.select("#tooltip")

    const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
    svg.selectAll("path")
      .data(countyData)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr('class', 'county')
      .attr("data-fips", (item)=> item.id)
      .attr("data-education", (item)=> {
        let id = item.id
        let county = educationData.find((data)=> {
          return data['fips'] === id
        })
        return county['bachelorsOrHigher']
      })
      .attr('fill', (item)=> {
        let id = item["id"]
        let countyEducation = educationData.find((item)=> { return item["fips"] == id })
        let percentage = countyEducation['bachelorsOrHigher']
        // 3% 12% 21% 30% 39% 48% 57%
        if(percentage <3){
          return legendColors[0]
        } else if(percentage <12){
          return legendColors[1]
        } else if(percentage <21){
          return legendColors[2]
        } else if(percentage <30){
          return legendColors[3]
        } else if(percentage <39){
          return legendColors[4]
        } else if(percentage <48){
          return legendColors[5]
        } else {
          return legendColors[6]
        }
      })
      .on('mouseover', (event, item)=> {
        tooltip.transition()
          .style('visibility', 'visible')

        let id = item.id
        let county = educationData.find((data)=> {
          return data['fips'] === id
        })

          tooltip.text(()=> `${county["area_name"]}, ${county["state"]} ${county["bachelorsOrHigher"]}%`)
          .attr("data-education", county["bachelorsOrHigher"])
      })
      .on('mouseout', (event, item)=> {
        tooltip.transition()
          .style('visibility', 'hidden')
      })

    const legend = d3.select("#legend")
      .append("svg")
      .attr("width", 800)
      .attr("height", 50)
      .selectAll('g')
      .data(legendColors)
      .enter()
      .append('g')
      .attr("transform", (d, i) => `translate(${i * 25 + 525}, 20)`);

    legend.append("rect")
      .attr("width", 24)
      .attr("height", 8)
      .attr("fill", (d) => d)
      .attr('stroke-width', 1)
      .attr('stroke', 'black');

    legend.append("text")
      .text((d, i) => legendLabels[i])
      .style('font-size', "9px")
      .attr("y", 16)
      .attr("x", 16);

  }

  useEffect(() => {
    d3.json(countyURL)
      .then(
        (data, err)=> {
          if(err){
            console.log('error:', err)
          }else{
            const countyData = topojson.feature(data, data.objects.counties).features
            setCountyData(countyData)
            console.log("data", countyData)
            d3.json(educationURL)
            .then(
              (educationData, error)=> {
                if(error){
                  console.log("error", error)
                } else{
                  setEducationData(educationData)
                  console.log("educationData", educationData)
                }
              }
            )
          }
        }
      )
  }, []);

  useEffect(() => {
    countyData && educationData && drawSvg();
  }, [countyData, educationData]);

  return (
    <div className="App">
      <h1 id="title">United States Educational Attainment</h1>
      <p id="description">Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</p>
      <div id="tooltip">tooltip</div>
      <div id="legend"></div>
      <div id="container"></div>
    </div>
  );
}

export default App;
