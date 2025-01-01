import React from 'react';
import * as d3 from "d3";

class RealMiniIntraDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of RealMiniIntraDiagram");
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructo

    componentDidMount(){
        console.log("In componenet did mount for RealMiniIntraDiagram");

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            console.log(" ccccccccccccccccccccccccccccccccccccccccccc");
            this.drawRealMiniIntraDiagram();
        })

        d3.select('#root').append('div')
        .attr("class", "tt")
        .attr("id", "tooltipMiniIntra")

        window.addEventListener("resize", this.redrawChart);
    }//end componentDidMount

    componentDidUpdate(prevProps, prevState){
        console.log("in component did update for realminiintradiagram ", this.props);
        console.log("prevprops ", prevProps);
        if(prevProps.selectedTreeName !== this.props.selectedTreeName){
            if(this.props.selectedTreeName !== null){
                console.log("Change for real mini intra diagram tree changed ", this.props.selectedTreeName);
                const divId = '#'+ this.props.id;
                let myDuration = 1500;
                this.drawRealMiniIntraDiagram = this.drawRealMiniIntraDiagram.bind(this);
                let ss = this.drawRealMiniIntraDiagram;
    
                setTimeout(function(){
                    d3.select(divId).select("#realMiniIntraSVG").remove();
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").remove();
                    d3.select('#root').select("#tooltipMiniIntra").select(".tail").remove();
                    ss();
                }, myDuration)
            }
        }else if((prevProps.selectedEdgeNamesIntraFilter !== this.props.selectedEdgeNamesIntraFilter)
        || (prevProps.selectedNodeNamesIntraFilter !== this.props.selectedNodeNamesIntraFilter)
        || (prevProps.selectedDirectionIntraFilter !== this.props.selectedDirectionIntraFilter)
        || (prevProps.selectedNodeTypesIntraFilter !== this.props.selectedNodeTypesIntraFilter)){
            console.log("props changed for real mini intra filter", this.props);

            const selectedEdgeNamesIntraFilter =this.props.selectedEdgeNamesIntraFilter;
            const selectedNodeNamesIntraFilter =this.props.selectedNodeNamesIntraFilter;
            const selectedNodeTypesIntraFilter = this.props.selectedNodeTypesIntraFilter;
            const selectedDirectionIntraFilter = this.props.selectedDirectionIntraFilter;

             let treeIntraDataFormatted = [];
            const selectedTreeIntraData = this.getSelectedTreeIntraData(this.props.treesIntraData, this.props.selectedTreeName);
            for(let i = 0; i < selectedTreeIntraData.length; i++){
                let filteredEdge = false;
                if(selectedEdgeNamesIntraFilter.length !== 0 || selectedNodeNamesIntraFilter.length !== 0 || selectedNodeTypesIntraFilter.length !== 0 || selectedDirectionIntraFilter !== null){

                    if(selectedEdgeNamesIntraFilter.length === 0){
                        filteredEdge = true;
                    }else{
                        for(let j = 0; j < selectedEdgeNamesIntraFilter.length; j++){
                            if(selectedEdgeNamesIntraFilter[j].value === selectedTreeIntraData[i].edgeType){
                                filteredEdge=true;
                                break;
                            }
                        }
                    }

                    if(filteredEdge && selectedNodeNamesIntraFilter.length === 0){
                        filteredEdge = true;
                    }else if(filteredEdge){
                        filteredEdge = false;
                        for(let j = 0; j < selectedNodeNamesIntraFilter.length; j++){
                            if((selectedNodeNamesIntraFilter[j].value === selectedTreeIntraData[i].startNode)
                            || (selectedNodeNamesIntraFilter[j].value === selectedTreeIntraData[i].endNode)){
                                filteredEdge=true;
                                break;
                            }
                        }
                    } 

                    if(filteredEdge && selectedNodeTypesIntraFilter.length === 0){
                        filteredEdge = true;
                    }else if(filteredEdge){
                        filteredEdge = false;
                        for(let j = 0; j < selectedNodeTypesIntraFilter.length; j++){
                            if((selectedNodeTypesIntraFilter[j].value === selectedTreeIntraData[i].startNodeType)
                            || (selectedNodeTypesIntraFilter[j].value === selectedTreeIntraData[i].endNodeType)){
                                filteredEdge=true;
                                break;
                            }
                        }
                    }

                    if(filteredEdge && selectedDirectionIntraFilter === null){
                        filteredEdge = true;
                    }else if(filteredEdge && selectedDirectionIntraFilter.value !== undefined && selectedNodeNamesIntraFilter.length !== 0 ){
                        filteredEdge = false;

                        if(selectedDirectionIntraFilter.value === "Either"){
                            filteredEdge = true;
                        }else if(selectedDirectionIntraFilter.value === "Outgoing"){
                            for(let j = 0; j < selectedNodeNamesIntraFilter.length; j++){
                                if((selectedNodeNamesIntraFilter[j].value === selectedTreeIntraData[i].startNode)){
                                    filteredEdge=true;
                                    break;
                                }
                            }
                        }else{
                            for(let j = 0; j < selectedNodeNamesIntraFilter.length; j++){
                                if((selectedNodeNamesIntraFilter[j].value === selectedTreeIntraData[i].endNode)){
                                    filteredEdge=true;
                                    break;
                                }
                            }

                        }
                    }
                }else{
                    filteredEdge=true;
                }

                if(filteredEdge){
                    treeIntraDataFormatted.push(selectedTreeIntraData[i]);
                }
            }//end for loop

            const divId = '#'+ this.props.id;
            d3.select(divId).select("svg").remove();
            d3.select('#root').select("#tooltipMiniIntra").select("svg").remove();
            d3.select('#root').select("#tooltipMiniIntra").select("div").remove();

            const height = this.state.height ;
            let width = this.state.width;
            let titleHeight = d3.select("#mini1Title").style("font-size");
            d3.select(divId).style("height", height + 'px')

            const svg = d3.select(divId).attr("class", "miniIntra").append('svg').attr("id", "realMiniIntraSVG")
            .attr("width", width).attr("height", height*20)
            .style("border", "solid").style("border-color", "black").style("border-bottom", 0+'px');
    
            let groupedIntraData = [];
            console.log('fff ', treeIntraDataFormatted);
            treeIntraDataFormatted.forEach(function(d,i){
                if(groupedIntraData.length === 0){
                    let tempObj = {};
                    tempObj.startType = d.startNodeType;
                    tempObj.endType = d.endNodeType;
                    tempObj.edges = [];
                    let edgeObj = {};
                    edgeObj.edgeType = d.edgeType;
                    edgeObj.data =[];
                    edgeObj.data.push(d);
                    tempObj.edges.push(edgeObj);
                    groupedIntraData.push(tempObj);
                }else{
                    let objFound = -1;
                    for(let j = 0; j < groupedIntraData.length; j++){
                        if(groupedIntraData[j].startType === d.startNodeType 
                            && groupedIntraData[j].endType === d.endNodeType){
                            objFound = j;
                            break;
                        }
                    }
    
                    if(objFound !== -1){
                        //check edge type same
                        let edges = groupedIntraData[objFound].edges;
                        let edgeFound = -1;
                        for(let k = 0; k < edges.length;k++){
                            if(edges[k].edgeType === d.edgeType){
                                edgeFound = k;
                                break;
                            }
                        }
    
                        if(edgeFound !== -1){
                            groupedIntraData[objFound].edges[edgeFound].data.push(d);
                        }else{ 
                            let edgeObj = {};
                            edgeObj.edgeType = d.edgeType;
                            edgeObj.data =[];
                            edgeObj.data.push(d);
                            groupedIntraData[objFound].edges.push(edgeObj);
                        }
                    }else{
                        let tempObj = {};
                        tempObj.startType = d.startNodeType;
                        tempObj.endType = d.endNodeType;
                        tempObj.edges = [];
                        let edgeObj = {};
                        edgeObj.edgeType = d.edgeType;
                        edgeObj.data =[];
                        edgeObj.data.push(d);
                        tempObj.edges.push(edgeObj);
                        groupedIntraData.push(tempObj);
                    }
                }
            })
    
            //sort edgesName 
            groupedIntraData.forEach(function(d,i){
                if(d.edges.length > 1){
                    groupedIntraData[i].edges.sort(function(a,b){
                        let aNumEdges = a.data.length;
                        let bNumEdges = b.data.length;
    
                        if(aNumEdges !== bNumEdges){
                            return (aNumEdges - bNumEdges) * -1;
                        }
    
                        let aEdgeType = a.edgeType.toLowerCase();
                        let bEdgeType = b.edgeType.toLowerCase();
    
                        if(aEdgeType < bEdgeType){
                            return -1;
                        }else if(bEdgeType < aEdgeType){
                            return 1;
                        }
                        return 0;
                    })
                }
            })
    
            //let sortedDataNodeType
            let sortedGroupedIntraData = groupedIntraData.sort(function(a,b){
                let aNumEdges = 0;
                a.edges.forEach(function(d,i){
                    aNumEdges = aNumEdges + d.data.length;
                })
    
                let bNumEdges = 0;
                b.edges.forEach(function(d,i){
                    bNumEdges = bNumEdges + d.data.length;
                })
    
                if(aNumEdges !== bNumEdges){
                    return (aNumEdges - bNumEdges)*-1;
                }
    
                let aStartType = a.startType.toLowerCase();
                let bStartType = b.startType.toLowerCase();
    
                if(aStartType < bStartType){
                    return -1;
                }else if(bStartType < aStartType){
                    return 1;
                }
    
                let aEndType = a.endType.toLowerCase();
                let bEndType = b.endType.toLowerCase();
    
                if(aEndType < bEndType){
                    return -1;
                }else if(bEndType < aEndType){
                    return 1;
                }
    
                return 0;
            })
    
            let dataIntraForD3 = [];
            sortedGroupedIntraData.forEach(function(d,i){
                d.edges.forEach(function(d2, i2){
                    let tempObj = {};
                    tempObj.startNodeType = d.startType;
                    tempObj.endNodeType = d.endType;
                    tempObj.edgeType = d2.edgeType;
                    tempObj.numEdges = d2.data.length;
                    tempObj.data = d2.data;
                    dataIntraForD3.push(tempObj);
                })
            })

            const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494', '#ffffb3'];
            const color = d3.scaleOrdinal( )
            .domain(this.props.uniqueNodeTypesAllTrees)
            .range(colorSet);
            const margin = 5;

            svg.append('g').attr("id", "miniIntraTitleNumber").append("text")
            .attr("x", 0 + margin) //Changes later
            .attr("y", parseFloat(titleHeight))
            .style("fill", "white")
            .style("font-size", titleHeight)
            .text("Total: " + treeIntraDataFormatted.length);

            const radius = (height - parseFloat(titleHeight) - margin)/3;
            const heightRect = (radius * 0.25) + radius;
            const scrollBarWidth = (width - svg.node().clientWidth)*2;
            let maxHeight = 0;
            
            d3.select('#root').select("#tooltipMiniIntra").append("svg").attr("class", "tail")
            .style('position', 'absolute')
            .style('top', '0')
            .style('left', '0')
            .attr("width", "100%")
            .attr("height", "100%")
            .append("path")
            .attr("d",`M 0, 0 L 30, 40 L 40, 30 Z`)
            .attr("fill", "lightgray")
            .style("stroke", "black")

            d3.select('#root').select("#tooltipMiniIntra").append("div")
            .attr("class", "content")
            .style('position', 'relative')
            .style("text-align", "center")
            .style('top', '0')
            .style('left', '0')
            .style('padding', '2px')
            .style('border', '1px solid black')
            .style('border-radius', '8px')
            .style('pointer-events', 'none')
            .style('background', 'lightgray')

            svg.append('g').attr("id", "nodeTypeDiagramsRect").selectAll("rect").data(dataIntraForD3).enter()
                .append("rect")
                    .attr('x', 0 + margin)
                    .attr('y', function(d,i ) {
                        let start = parseFloat(titleHeight) + margin;

                        if(i === dataIntraForD3.length - 1){
                            maxHeight = (i*(heightRect+margin)) + start + heightRect + margin*2;
                        }
                        
                        return (i*(heightRect+margin)) + start; 
                    })
                    .attr('width', width - scrollBarWidth - margin*4)
                    .attr('height', heightRect)
                    .attr("fill", function(d){
                        return "white"
                    })
                    .attr("stroke", "#c6c6c6")
                    .on("mouseover", function(event,d){
                        console.log("rect intra hovered filter ", d);
                        d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');
    
                        let coords = d3.pointer( event,  d3.select('.colContainer').node());
                        let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                        let midHeight = leftSideWidth.height / 2;
                        let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];
    
                        d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                        .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");
    
                        d3.select('#root').select("#tooltipMiniIntra").select(".content")
                        .style('margin-left', (firstPoint[0]) +'px');
                        d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");
    
                        let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                        let header = table.append("thead").append("tr");
    
                        header.selectAll("th")
                            .data(["Start Node", "End Node"])
                            .enter()
                            .append("th")
                            .text(function(d){
                                return d;
                            })
    
                        let rowArray = [];
                        d.data.forEach(function(d2,i2){
                            rowArray.push([d2.startNode, d2.endNode])
                        })
    
                        let tablebody = table.append("tbody");
                        let rows = tablebody
                                .selectAll("tr")
                                .data(rowArray)
                                .enter()
                                .append("tr");
                        // We built the rows using the nested array - now each row has its own array.
                        rows.selectAll("td")
                            // each row has data associated; we get it and enter it for the cells.
                                .data(function(d) {
                                    return d;
                                })
                                .enter()
                                .append("td")
                                .text(function(d) {
                                    return d;
                                });
    
                        d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                        .style("top", (coords[1]) + "px");
                        
                        let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                        d3.select('#root').select("#tooltipMiniIntra").select(".content")
                        .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                        d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                        d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                        d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");
    
                        //Highlight rect
                        svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                            .attr("stroke", function(d2,i2){
                                if(d2.startNodeType === d.startNodeType &&
                                d2.endNodeType === d.endNodeType &&
                                d2.edgeType === d.edgeType){
                                    return "black";
                                }
                                return "#c6c6c6";
                            })
                            .style("stroke-width", function(d2,i2){
                                if(d2.startNodeType === d.startNodeType &&
                                    d2.endNodeType === d.endNodeType &&
                                    d2.edgeType === d.edgeType){
                                        return 3;
                                }
                                return 1;
                            })
    
                    })
                    .on("mouseout", function(event, d){
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                        svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                            .attr("stroke", "#c6c6c6")
                            .style("stroke-width", 1);
                    })

            svg.append('g').attr("id", "nodeTypeDiagramsStartCircles").selectAll("circles").data(dataIntraForD3).enter().append("circle")
                .attr("r", radius/2)
                .attr("cx", radius/2 + margin + ((radius * 0.25)/2))
                .attr("cy", function(d,i){
                    let start = parseFloat(titleHeight) + margin + radius/2;
                    let rectMargin = ((radius * 0.25)/2)
                    let returnValue = i * (heightRect+margin) + start + rectMargin;
                    return returnValue;
                })
                .style("fill", function(d,i){
                    return color(d.startNodeType);
                })
                .style("stroke", "black")
                .on("mouseover", function(event,d){
                    console.log("ccircle rect intra hovered filter ", d);
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                    let coords = d3.pointer( event,  d3.select('.colContainer').node());
                    let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                    let midHeight = leftSideWidth.height / 2;
                    let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                    .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style('margin-left', (firstPoint[0]) +'px');

                    d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");
                    let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                    let header = table.append("thead").append("tr");

                    header.selectAll("th")
                        .data(["Start Node", "End Node"])
                        .enter()
                        .append("th")
                        .text(function(d){
                            return d;
                        })

                    let rowArray = [];
                    d.data.forEach(function(d2,i2){
                        rowArray.push([d2.startNode, d2.endNode])
                    })

                    let tablebody = table.append("tbody");
                    let rows = tablebody
                            .selectAll("tr")
                            .data(rowArray)
                            .enter()
                            .append("tr");
                    // We built the rows using the nested array - now each row has its own array.
                    rows.selectAll("td")
                        // each row has data associated; we get it and enter it for the cells.
                            .data(function(d) {
                                return d;
                            })
                            .enter()
                            .append("td")
                            .text(function(d) {
                                return d;
                            });
                    
                    d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                    .style("top", (coords[1]) + "px");
                    
                    let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                    d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                    //Highlight rect
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return "black";
                            }

                            return "#c6c6c6";
                        })
                        .style("stroke-width", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                                d2.endNodeType === d.endNodeType &&
                                d2.edgeType === d.edgeType){
                                    return 3;
                                }
                                return 1;
                        })
                })
                .on("mouseout", function(event, d){
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", "#c6c6c6")
                        .style("stroke-width", 1);
                })

            svg.append('g').attr("id", "nodeTypeDiagramsEndCircles").selectAll("circles").data(dataIntraForD3).enter().append("circle")
                .attr("r", radius/2)
                .attr("cx", (width - scrollBarWidth - margin*4)- (radius/2  + ((radius * 0.25)/2)) + margin)
                .attr("cy", function(d,i){
                    let start = parseFloat(titleHeight) + margin + radius/2;
                    let rectMargin = ((radius * 0.25)/2)
                    let returnValue = i * (heightRect+margin) + start + rectMargin;
                    return returnValue;
                })
                .style("fill", function(d,i){
                    return color(d.endNodeType);
                })
                .style("stroke", "black")
                .on("mouseover", function(event,d){
                    console.log("end circle filter rect intra hovered ", d);
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                    let coords = d3.pointer( event,  d3.select('.colContainer').node());
                    let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                    let midHeight = leftSideWidth.height / 2;
                    let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                    .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style('margin-left', (firstPoint[0]) +'px');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                    let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                    let header = table.append("thead").append("tr");

                    header.selectAll("th")
                        .data(["Start Node", "End Node"])
                        .enter()
                        .append("th")
                        .text(function(d){
                            return d;
                        })

                    let rowArray = [];
                    d.data.forEach(function(d2,i2){
                        rowArray.push([d2.startNode, d2.endNode])
                    })

                    let tablebody = table.append("tbody");
                    let rows = tablebody
                            .selectAll("tr")
                            .data(rowArray)
                            .enter()
                            .append("tr");
                    // We built the rows using the nested array - now each row has its own array.
                    rows.selectAll("td")
                        // each row has data associated; we get it and enter it for the cells.
                            .data(function(d) {
                                return d;
                            })
                            .enter()
                            .append("td")
                            .text(function(d) {
                                return d;
                            });
                    

                    d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                    .style("top", (coords[1]) + "px");
                    let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                    d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                    //Highlight rect
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return "black";
                            }
                            return "#c6c6c6";
                        })
                        .style("stroke-width", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                                d2.endNodeType === d.endNodeType &&
                                d2.edgeType === d.edgeType){
                                    return 3;
                                }
                                return 1;
                        })

                })
                .on("mouseout", function(event, d){
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", "#c6c6c6")
                        .style("stroke-width", 1);
                })

            svg.append('defs')
                .append('marker')
                .attr('id', 'arrow')
                .attr('viewBox', [0, -5, 10, 10])
                .attr('refX', 5)
                .attr('refY', 0)
                .attr('markerWidth', 10)
                .attr('markerHeight', 10)
                .attr('orient', 'auto-start-reverse')
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5')
                .attr('stroke', 'black');

            svg.append('g').attr("id", "nodeTypeDiagramsEdges").selectAll("line").data(dataIntraForD3).enter().append("line")
                .attr("x1", radius + margin + ((radius * 0.25)/2) )
                .attr("x2", (width - scrollBarWidth - margin*4)- (radius  + ((radius * 0.25)/2)) + margin -5)
                .attr("y1", function(d, i){
                    let start = parseFloat(titleHeight) + margin;
                    return (i*(heightRect+margin)) + start + (heightRect/2);
                })
                .attr("y2", function(d,i){
                    let start = parseFloat(titleHeight) + margin
                    return (i*(heightRect+margin)) + start + (heightRect/2);
                })
                .attr("stroke", "black")
                .attr('marker-end', 'url(#arrow)')
                .on("mouseover", function(event,d){
                    console.log("edges rect intra hovered filter", d);
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                    let coords = d3.pointer( event,  d3.select('.colContainer').node());
                    let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                    let midHeight = leftSideWidth.height / 2;
                    let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                    .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style('margin-left', (firstPoint[0]) +'px');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                    let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                    let header = table.append("thead").append("tr");

                    header.selectAll("th")
                        .data(["Start Node", "End Node"])
                        .enter()
                        .append("th")
                        .text(function(d){
                            return d;
                        })

                    let rowArray = [];
                    d.data.forEach(function(d2,i2){
                        rowArray.push([d2.startNode, d2.endNode])
                    })

                    let tablebody = table.append("tbody");
                    let rows = tablebody
                            .selectAll("tr")
                            .data(rowArray)
                            .enter()
                            .append("tr");
                    // We built the rows using the nested array - now each row has its own array.
                    rows.selectAll("td")
                        // each row has data associated; we get it and enter it for the cells.
                            .data(function(d) {
                                return d;
                            })
                            .enter()
                            .append("td")
                            .text(function(d) {
                                return d;
                            });
                    
                    d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                    .style("top", (coords[1]) + "px");
                    
                    let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                    d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                    //Highlight rect
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return "black";
                            }
                            return "#c6c6c6";
                        })
                        .style("stroke-width", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                                d2.endNodeType === d.endNodeType &&
                                d2.edgeType === d.edgeType){
                                    return 3;
                                }
                                return 1;
                        })

                })
                .on("mouseout", function(event, d){
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", "#c6c6c6")
                        .style("stroke-width", 1);

                })
            svg.append('g').attr("id", "nodeTypeDiagramsEdgeNumber").selectAll("text").data(dataIntraForD3).enter().append("text")
                .attr("x", ((width - scrollBarWidth - margin*4)/2) + margin) 
                .attr("y", function(d,i){
                    let start = parseFloat(titleHeight) + margin;
                    return (i*(heightRect+margin)) + start + (heightRect/2) - (parseFloat(titleHeight)/4);

                })
                .style("fill", "black")
                .attr("text-anchor", "middle")
                .style("font-size", titleHeight)
                .text(function(d){
                    return d.numEdges;
                })
                .on("mouseover", function(event,d){
                    console.log("rect intra hovered ", d);
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                    let coords = d3.pointer( event,  d3.select('.colContainer').node());
                    let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                    let midHeight = leftSideWidth.height / 2;
                    let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                    .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style('margin-left', (firstPoint[0]) +'px');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                    let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                    let header = table.append("thead").append("tr");

                    header.selectAll("th")
                        .data(["Start Node", "End Node"])
                        .enter()
                        .append("th")
                        .text(function(d){
                            return d;
                        })

                    let rowArray = [];
                    d.data.forEach(function(d2,i2){
                        rowArray.push([d2.startNode, d2.endNode])
                    })

                    let tablebody = table.append("tbody");
                    let rows = tablebody
                            .selectAll("tr")
                            .data(rowArray)
                            .enter()
                            .append("tr");
                    // We built the rows using the nested array - now each row has its own array.
                    rows.selectAll("td")
                        // each row has data associated; we get it and enter it for the cells.
                            .data(function(d) {
                                return d;
                            })
                            .enter()
                            .append("td")
                            .text(function(d) {
                                return d;
                            });
                    

                    d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                    .style("top", (coords[1]) + "px");
                    
                    let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                    d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                    //Highlight rect
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return "black";
                            }
                            return "#c6c6c6";
                        })
                        .style("stroke-width", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                                d2.endNodeType === d.endNodeType &&
                                d2.edgeType === d.edgeType){
                                    return 3;
                                }
                                return 1;
                        })
                })
                .on("mouseout", function(event, d){
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", "#c6c6c6")
                        .style("stroke-width", 1);
                });

            svg.append('g').attr("id", "nodeTypeDiagramsEdgeType").selectAll("text").data(dataIntraForD3).enter().append("text")
                .attr("x", ((width - scrollBarWidth - margin*4)/2) + margin) 
                .attr("y", function(d,i){
                    let start = parseFloat(titleHeight)*2 + margin;
                    return (i*(heightRect+margin)) + start + (heightRect/2) ;
                })
                .style("fill", "black")
                .attr("text-anchor", "middle")
                .style("font-size", titleHeight)
                .text(function(d){
                    return d.edgeType;
                })
                .on("mouseover", function(event,d){
                    console.log("edge type filter rect intra hovered ", d);
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                    let coords = d3.pointer( event,  d3.select('.colContainer').node());
                    let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                    let midHeight = leftSideWidth.height / 2;
                    let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                    .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style('margin-left', (firstPoint[0]) +'px');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                    let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                    let header = table.append("thead").append("tr");

                    header.selectAll("th")
                        .data(["Start Node", "End Node"])
                        .enter()
                        .append("th")
                        .text(function(d){
                            return d;
                        })

                    let rowArray = [];
                    d.data.forEach(function(d2,i2){
                        rowArray.push([d2.startNode, d2.endNode])
                    })

                    let tablebody = table.append("tbody");
                    let rows = tablebody
                            .selectAll("tr")
                            .data(rowArray)
                            .enter()
                            .append("tr");
                    // We built the rows using the nested array - now each row has its own array.
                    rows.selectAll("td")
                        // each row has data associated; we get it and enter it for the cells.
                            .data(function(d) {
                                return d;
                            })
                            .enter()
                            .append("td")
                            .text(function(d) {
                                return d;
                            });
                
                    d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                    .style("top", (coords[1]) + "px");
                    
                    let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                    d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");


                    //Highlight rect
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return "black";
                            }
                            return "#c6c6c6";
                        })
                        .style("stroke-width", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                                d2.endNodeType === d.endNodeType &&
                                d2.edgeType === d.edgeType){
                                    return 3;
                                }
                                return 1;
                        })
                })
                .on("mouseout", function(event, d){
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", "#c6c6c6")
                        .style("stroke-width", 1);
                });


            svg.attr("height", Math.max(height, maxHeight));
            d3.select("#tooltipMiniIntra").raise();
        }//end else if
    }//end component did update

    componentWillUnmount(){
        console.log("unmount realminiintradiagram");
        window.removeEventListener("resize", this.redrawChart, false);
        d3.select('#root').select("#tooltipMiniIntra").remove();
    }//end componentWillUnmount

    //Get the width of the div
    getWidth(){
        const divId = '#'+ this.props.id;
        return d3.select(divId).node().getBoundingClientRect().width;
    }//end getWidth function

    //Get the height of the main area
    getHeight(){
        return d3.select('.mini').node().getBoundingClientRect().height -  (d3.select('#mini1Title').node().getBoundingClientRect().height)*1;
    }//end getHeight function

    redrawChart(){
        console.log("In redrawChart for RealMiniIntraDiagram");
        //Gets and resets the height and width
        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();
        d3.select('#root').select("#tooltipMiniIntra").select("svg").remove();
        d3.select('#root').select("#tooltipMiniIntra").select("div").remove();

        //Redraw the direct chord diagram
        this.drawRealMiniIntraDiagram = this.drawRealMiniIntraDiagram.bind(this);
        console.log(" ddddddddddddddddddddddddddddddddddddddddddd");
        this.drawRealMiniIntraDiagram();
    }//end redrawChart function

    // Get intra data given name
    getSelectedTreeIntraData(data, name){
        let index = -1;
        for(let i = 0; i < data.length; i++){
            if(data[i][0].treeName === name){
                index = i;
                break;
            }
        }

        if(index === -1){
            return [];
        }else{
            return data[index];
        }
    }//end function

    drawRealMiniIntraDiagram(){
        console.log("???????????????????????????????????????????????In drawRealMiniIntraDiagram", this.props);

        const divId = '#'+ this.props.id;
        const height = this.state.height ;
        let width = this.state.width;
        let titleHeight = d3.select("#mini1Title").style("font-size");
        d3.select('#root').select("#tooltipMiniIntra")
        .style('position', 'absolute').style('display', 'none');

        d3.select(divId).style("height", height + 'px')

        const svg = d3.select(divId).attr("class", "miniIntra").append('svg').attr("id", "realMiniIntraSVG")
        .attr("width", width).attr("height", height*20)
        .style("border", "solid").style("border-color", "black").style("border-bottom", 0+'px');

        const selectedTreeIntraData = this.getSelectedTreeIntraData(this.props.treesIntraData, this.props.selectedTreeName);
        let groupedIntraData = [];

        selectedTreeIntraData.forEach(function(d,i){
            if(groupedIntraData.length === 0){
                let tempObj = {};
                tempObj.startType = d.startNodeType;
                tempObj.endType = d.endNodeType;
                tempObj.edges = [];
                let edgeObj = {};
                edgeObj.edgeType = d.edgeType;
                edgeObj.data =[];
                edgeObj.data.push(d);
                tempObj.edges.push(edgeObj);
                groupedIntraData.push(tempObj);
            }else{
                let objFound = -1;
                for(let j = 0; j < groupedIntraData.length; j++){
                    if(groupedIntraData[j].startType === d.startNodeType 
                        && groupedIntraData[j].endType === d.endNodeType){
                        objFound = j;
                        break;
                    }
                }

                if(objFound !== -1){
                    //check edge type same
                    let edges = groupedIntraData[objFound].edges;
                    let edgeFound = -1;
                    for(let k = 0; k < edges.length;k++){
                        if(edges[k].edgeType === d.edgeType){
                            edgeFound = k;
                            break;
                        }
                    }

                    if(edgeFound !== -1){
                        groupedIntraData[objFound].edges[edgeFound].data.push(d);
                    }else{ 
                        let edgeObj = {};
                        edgeObj.edgeType = d.edgeType;
                        edgeObj.data =[];
                        edgeObj.data.push(d);
                        groupedIntraData[objFound].edges.push(edgeObj);
                    }
                }else{
                    let tempObj = {};
                    tempObj.startType = d.startNodeType;
                    tempObj.endType = d.endNodeType;
                    tempObj.edges = [];
                    let edgeObj = {};
                    edgeObj.edgeType = d.edgeType;
                    edgeObj.data =[];
                    edgeObj.data.push(d);
                    tempObj.edges.push(edgeObj);
                    groupedIntraData.push(tempObj);
                }
            }
        })

        //sort edgesName 
        groupedIntraData.forEach(function(d,i){
            if(d.edges.length > 1){
                groupedIntraData[i].edges.sort(function(a,b){
                    let aNumEdges = a.data.length;
                    let bNumEdges = b.data.length;

                    if(aNumEdges !== bNumEdges){
                        return (aNumEdges - bNumEdges) * -1;
                    }

                    let aEdgeType = a.edgeType.toLowerCase();
                    let bEdgeType = b.edgeType.toLowerCase();

                    if(aEdgeType < bEdgeType){
                        return -1;
                    }else if(bEdgeType < aEdgeType){
                        return 1;
                    }

                    return 0;
                })
            }
        })

        //let sortedDataNodeType
        let sortedGroupedIntraData = groupedIntraData.sort(function(a,b){
            let aNumEdges = 0;
            a.edges.forEach(function(d,i){
                aNumEdges = aNumEdges + d.data.length;
            })

            let bNumEdges = 0;
            b.edges.forEach(function(d,i){
                bNumEdges = bNumEdges + d.data.length;
            })

            if(aNumEdges !== bNumEdges){
                return (aNumEdges - bNumEdges)*-1;
            }

            let aStartType = a.startType.toLowerCase();
            let bStartType = b.startType.toLowerCase();

            if(aStartType < bStartType){
                return -1;
            }else if(bStartType < aStartType){
                return 1;
            }

            let aEndType = a.endType.toLowerCase();
            let bEndType = b.endType.toLowerCase();

            if(aEndType < bEndType){
                return -1;
            }else if(bEndType < aEndType){
                return 1;
            }

            return 0;
        })

        let dataIntraForD3 = [];
        sortedGroupedIntraData.forEach(function(d,i){
            d.edges.forEach(function(d2, i2){
                let tempObj = {};
                tempObj.startNodeType = d.startType;
                tempObj.endNodeType = d.endType;
                tempObj.edgeType = d2.edgeType;
                tempObj.numEdges = d2.data.length;
                tempObj.data = d2.data;
                dataIntraForD3.push(tempObj);
            })
        })

        const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#ffffb3'];
        const color = d3.scaleOrdinal( )
        .domain(this.props.uniqueNodeTypesAllTrees)
        .range(colorSet);
        const margin = 5;

        svg.append('g').attr("id", "miniIntraTitleNumber").append("text")
        .attr("x", 0 + margin) //Changes later
        .attr("y", parseFloat(titleHeight))
        .style("fill", "white")
        .style("font-size", titleHeight)
        .text("Total: " + selectedTreeIntraData.length);

        const radius = (height - parseFloat(titleHeight) - margin)/3;
        const heightRect = (radius * 0.25) + radius;
        const scrollBarWidth = (width - svg.node().clientWidth)*2;
        let maxHeight = 0;

        d3.select('#root').select("#tooltipMiniIntra").append("svg").attr("class", "tail")
        .style('position', 'absolute')
        .style('top', '0')
        .style('left', '0')
        .attr("width", "100%")
        .attr("height", "100%")
        .append("path")
        .attr("d",`M 0, 0 L 30, 40 L 40, 30 Z`)
        .attr("fill", "lightgray")
        .style("stroke", "black")

        d3.select('#root').select("#tooltipMiniIntra").append("div")
        .attr("class", "content")
        .style('position', 'relative')
        .style("text-align", "center")
        .style('top', '0')
        .style('left', '0')
        .style('padding', '2px')
        .style('border', '1px solid black')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('background', 'lightgray')
        

        svg.append('g').attr("id", "nodeTypeDiagramsRect").selectAll("rect").data(dataIntraForD3).enter()
            .append("rect")
                .attr('x', 0 + margin)
                .attr('y', function(d,i ) {
                    let start = parseFloat(titleHeight) + margin;
                    if(i === dataIntraForD3.length - 1){
                        maxHeight = (i*(heightRect+margin)) + start + heightRect + margin*2;
                    }
                    return (i*(heightRect+margin)) + start; 
                })
                .attr('width', width - scrollBarWidth - margin*4)
                .attr('height', heightRect)
                .attr("fill", function(d){
                    return "white"
                })
                .attr("stroke", "#c6c6c6")
                .on("mouseover", function(event,d){
                    console.log("regular rect rect intra hovered ", d);
                    d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                    let coords = d3.pointer( event,  d3.select('.colContainer').node());
                    let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                    let midHeight = leftSideWidth.height / 2;
                    let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                    .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style('margin-left', (firstPoint[0]) +'px');
                    d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                    let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                    let header = table.append("thead").append("tr");

                    header.selectAll("th")
                        .data(["Start Node", "End Node"])
                        .enter()
                        .append("th")
                        .text(function(d){
                            return d;
                        })

                    let rowArray = [];
                    d.data.forEach(function(d2,i2){
                        rowArray.push([d2.startNode, d2.endNode])
                    })
                    console.log("row array ", rowArray)
                    console.log(" intra ", d3.select('#root').select("#tooltipMiniIntra"));

                    let tablebody = table.append("tbody");
                    let rows = tablebody
                            .selectAll("tr")
                            .data(rowArray)
                            .enter()
                            .append("tr");
                    // We built the rows using the nested array - now each row has its own array.
                    rows.selectAll("td")
                        // each row has data associated; we get it and enter it for the cells.
                            .data(function(d) {
                                return d;
                            })
                            .enter()
                            .append("td")
                            .text(function(d) {
                                return d;
                            });
                    

                    d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                    .style("top", (coords[1]) + "px");

                    console.log(" cpntent ", d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div"));

                    if(d3.select('#root').select("#tooltipMiniIntra").select(".content").node() === null){
                        console.log("NULLL here intra ",  d3.select('#root').select("#tooltipMiniIntra").select(".content").node());
                    }
                    
                    let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                    d3.select('#root').select("#tooltipMiniIntra").select(".content")
                    .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                    d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                    d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                    //Highlight rect
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return "black";
                            }
                            return "#c6c6c6";
                        })
                        .style("stroke-width", function(d2,i2){
                            if(d2.startNodeType === d.startNodeType &&
                                d2.endNodeType === d.endNodeType &&
                                d2.edgeType === d.edgeType){
                                    return 3;
                                }
                                return 1;
                        })

                    // console.log(" i am here at end of mouseover", d);

                })
                .on("mouseout", function(event, d){
                   d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                   d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                    svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                        .attr("stroke", "#c6c6c6")
                        .style("stroke-width", 1);
                })
        
        svg.append('g').attr("id", "nodeTypeDiagramsStartCircles").selectAll("circles").data(dataIntraForD3).enter().append("circle")
            .attr("r", radius/2)
            .attr("cx", radius/2 + margin + ((radius * 0.25)/2))
            .attr("cy", function(d,i){
                let start = parseFloat(titleHeight) + margin + radius/2;
                let rectMargin = ((radius * 0.25)/2)
                let returnValue = i * (heightRect+margin) + start + rectMargin;
                return returnValue;
            })
            .style("fill", function(d,i){
                return color(d.startNodeType);
            })
            .style("stroke", "black")
            .on("mouseover", function(event,d){
                console.log("start circle rect intra hovered ", d);
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                let coords = d3.pointer( event,  d3.select('.colContainer').node());
                let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                let midHeight = leftSideWidth.height / 2;
                let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style('margin-left', (firstPoint[0]) +'px');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                let header = table.append("thead").append("tr");

                header.selectAll("th")
                    .data(["Start Node", "End Node"])
                    .enter()
                    .append("th")
                    .text(function(d){
                        return d;
                    })

                let rowArray = [];
                d.data.forEach(function(d2,i2){
                    rowArray.push([d2.startNode, d2.endNode])
                })

                let tablebody = table.append("tbody");
                let rows = tablebody
                        .selectAll("tr")
                        .data(rowArray)
                        .enter()
                        .append("tr");
                // We built the rows using the nested array - now each row has its own array.
                rows.selectAll("td")
                    // each row has data associated; we get it and enter it for the cells.
                        .data(function(d) {
                            return d;
                        })
                        .enter()
                        .append("td")
                        .text(function(d) {
                            return d;
                        });
                
                d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                .style("top", (coords[1]) + "px");
                
                let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                //Highlight rect
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                        d2.endNodeType === d.endNodeType &&
                        d2.edgeType === d.edgeType){
                            return "black";
                        }

                        return "#c6c6c6";
                    })
                    .style("stroke-width", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return 3;
                            }

                            return 1;
                    })

            })
            .on("mouseout", function(event, d){
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", "#c6c6c6")
                    .style("stroke-width", 1);
            })

        svg.append('g').attr("id", "nodeTypeDiagramsEndCircles").selectAll("circles").data(dataIntraForD3).enter().append("circle")
            .attr("r", radius/2)
            .attr("cx", (width - scrollBarWidth - margin*4)- (radius/2  + ((radius * 0.25)/2)) + margin)
            .attr("cy", function(d,i){
                let start = parseFloat(titleHeight) + margin + radius/2;
                let rectMargin = ((radius * 0.25)/2)
                let returnValue = i * (heightRect+margin) + start + rectMargin;
                return returnValue;
            })
            .style("fill", function(d,i){
                return color(d.endNodeType);
            })
            .style("stroke", "black")
            .on("mouseover", function(event,d){
                console.log("end circle rect intra hovered ", d);
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                let coords = d3.pointer( event,  d3.select('.colContainer').node());
                let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                let midHeight = leftSideWidth.height / 2;
                let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style('margin-left', (firstPoint[0]) +'px');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                let header = table.append("thead").append("tr");

                header.selectAll("th")
                    .data(["Start Node", "End Node"])
                    .enter()
                    .append("th")
                    .text(function(d){
                        return d;
                    })

                let rowArray = [];
                d.data.forEach(function(d2,i2){
                    rowArray.push([d2.startNode, d2.endNode])
                })

                let tablebody = table.append("tbody");
                let rows = tablebody
                        .selectAll("tr")
                        .data(rowArray)
                        .enter()
                        .append("tr");
                // We built the rows using the nested array - now each row has its own array.
                rows.selectAll("td")
                    // each row has data associated; we get it and enter it for the cells.
                        .data(function(d) {
                            return d;
                        })
                        .enter()
                        .append("td")
                        .text(function(d) {
                            return d;
                        });
                
                d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                .style("top", (coords[1]) + "px");
                
                let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                //Highlight rect
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                        d2.endNodeType === d.endNodeType &&
                        d2.edgeType === d.edgeType){
                            return "black";
                        }

                        return "#c6c6c6";
                    })
                    .style("stroke-width", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return 3;
                            }

                            return 1;
                    })

            })
            .on("mouseout", function(event, d){
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", "#c6c6c6")
                    .style("stroke-width", 1);
            })

        svg.append('defs')
            .append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', [0, -5, 10, 10])
            .attr('refX', 5)
            .attr('refY', 0)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('stroke', 'black');

        svg.append('g').attr("id", "nodeTypeDiagramsEdges").selectAll("line").data(dataIntraForD3).enter().append("line")
            .attr("x1", radius + margin + ((radius * 0.25)/2) )
            .attr("x2", (width - scrollBarWidth - margin*4)- (radius  + ((radius * 0.25)/2)) + margin -5)
            .attr("y1", function(d, i){
                let start = parseFloat(titleHeight) + margin;
                return (i*(heightRect+margin)) + start + (heightRect/2);
            })
            .attr("y2", function(d,i){
                let start = parseFloat(titleHeight) + margin;
                return (i*(heightRect+margin)) + start + (heightRect/2);
            })
            .attr("stroke", "black")
            .attr('marker-end', 'url(#arrow)')
            .on("mouseover", function(event,d){
                console.log("edge rect intra hovered ", d);
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                let coords = d3.pointer( event,  d3.select('.colContainer').node());
                let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                let midHeight = leftSideWidth.height / 2;
                let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style('margin-left', (firstPoint[0]) +'px');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                let header = table.append("thead").append("tr");

                header.selectAll("th")
                    .data(["Start Node", "End Node"])
                    .enter()
                    .append("th")
                    .text(function(d){
                        return d;
                    })

                let rowArray = [];
                d.data.forEach(function(d2,i2){
                    rowArray.push([d2.startNode, d2.endNode])
                })

                let tablebody = table.append("tbody");
                let rows = tablebody
                        .selectAll("tr")
                        .data(rowArray)
                        .enter()
                        .append("tr");
                // We built the rows using the nested array - now each row has its own array.
                rows.selectAll("td")
                    // each row has data associated; we get it and enter it for the cells.
                        .data(function(d) {
                            return d;
                        })
                        .enter()
                        .append("td")
                        .text(function(d) {
                            return d;
                        });
                
                d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                .style("top", (coords[1]) + "px");
                
                let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                //Highlight rect
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                        d2.endNodeType === d.endNodeType &&
                        d2.edgeType === d.edgeType){
                            return "black";
                        }

                        return "#c6c6c6";
                    })
                    .style("stroke-width", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return 3;
                            }

                            return 1;
                    })

            })
            .on("mouseout", function(event, d){
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", "#c6c6c6")
                    .style("stroke-width", 1);
            })
        svg.append('g').attr("id", "nodeTypeDiagramsEdgeNumber").selectAll("text").data(dataIntraForD3).enter().append("text")
            .attr("x", ((width - scrollBarWidth - margin*4)/2) + margin) 
            .attr("y", function(d,i){
                let start = parseFloat(titleHeight) + margin;
                return (i*(heightRect+margin)) + start + (heightRect/2) - (parseFloat(titleHeight)/4);
            })
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .style("font-size", titleHeight)
            .text(function(d){
                return d.numEdges;
            })
            .on("mouseover", function(event,d){
                console.log("edge number rect intra hovered ", d);
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                let coords = d3.pointer( event,  d3.select('.colContainer').node());
                let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                let midHeight = leftSideWidth.height / 2;
                let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style('margin-left', (firstPoint[0]) +'px');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                let header = table.append("thead").append("tr");

                header.selectAll("th")
                    .data(["Start Node", "End Node"])
                    .enter()
                    .append("th")
                    .text(function(d){
                        return d;
                    })

                let rowArray = [];
                d.data.forEach(function(d2,i2){
                    rowArray.push([d2.startNode, d2.endNode])
                })

                let tablebody = table.append("tbody");
                let rows = tablebody
                        .selectAll("tr")
                        .data(rowArray)
                        .enter()
                        .append("tr");
                // We built the rows using the nested array - now each row has its own array.
                rows.selectAll("td")
                    // each row has data associated; we get it and enter it for the cells.
                        .data(function(d) {
                            return d;
                        })
                        .enter()
                        .append("td")
                        .text(function(d) {
                            return d;
                        });
                
                d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                .style("top", (coords[1]) + "px");
                
                let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                //Highlight rect
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                        d2.endNodeType === d.endNodeType &&
                        d2.edgeType === d.edgeType){
                            return "black";
                        }
                        return "#c6c6c6";
                    })
                    .style("stroke-width", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return 3;
                            }
                            return 1;
                    })
            })
            .on("mouseout", function(event, d){
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", "#c6c6c6")
                    .style("stroke-width", 1);
            });

        svg.append('g').attr("id", "nodeTypeDiagramsEdgeType").selectAll("text").data(dataIntraForD3).enter().append("text")
            .attr("x", ((width - scrollBarWidth - margin*4)/2) + margin) 
            .attr("y", function(d,i){
                let start = parseFloat(titleHeight)*2 + margin;
                return (i*(heightRect+margin)) + start + (heightRect/2) ;
            })
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .style("font-size", titleHeight)
            .text(function(d){
                return d.edgeType;
            })
            .on("mouseover", function(event,d){
                console.log("edge type rect intra hovered ", d);
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'inline');

                let coords = d3.pointer( event,  d3.select('.colContainer').node());
                let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                let midHeight = leftSideWidth.height / 2;
                let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path')
                .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");

                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style('margin-left', (firstPoint[0]) +'px');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").append("div").style("padding", "5px");

                let table = d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").append("table");
                let header = table.append("thead").append("tr");

                header.selectAll("th")
                    .data(["Start Node", "End Node"])
                    .enter()
                    .append("th")
                    .text(function(d){
                        return d;
                    })

                let rowArray = [];
                d.data.forEach(function(d2,i2){
                    rowArray.push([d2.startNode, d2.endNode])
                })

                let tablebody = table.append("tbody");
                let rows = tablebody
                        .selectAll("tr")
                        .data(rowArray)
                        .enter()
                        .append("tr");
                // We built the rows using the nested array - now each row has its own array.
                rows.selectAll("td")
                    // each row has data associated; we get it and enter it for the cells.
                        .data(function(d) {
                            return d;
                        })
                        .enter()
                        .append("td")
                        .text(function(d) {
                            return d;
                        });

                d3.select('#root').select("#tooltipMiniIntra").style("left", ( coords[0]) + "px")
                .style("top", (coords[1]) + "px");
                
                let toolTipHeight =  d3.select('#root').select("#tooltipMiniIntra").select(".content").node().getBoundingClientRect().height;
                d3.select('#root').select("#tooltipMiniIntra").select(".content")
                .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                d3.select('#root').select("#tooltipMiniIntra").style("height", ((firstPoint[1]*-1) + 10) + 'px')
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                d3.select('#root').select("#tooltipMiniIntra").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                //Highlight rect
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                        d2.endNodeType === d.endNodeType &&
                        d2.edgeType === d.edgeType){
                            return "black";
                        }
                        return "#c6c6c6";
                    })
                    .style("stroke-width", function(d2,i2){
                        if(d2.startNodeType === d.startNodeType &&
                            d2.endNodeType === d.endNodeType &&
                            d2.edgeType === d.edgeType){
                                return 3;
                            }
                            return 1;
                    })
            })
            .on("mouseout", function(event, d){
                d3.select('#root').select("#tooltipMiniIntra").style('display', 'none');
                d3.select('#root').select("#tooltipMiniIntra").select(".content").select("div").remove();
                svg.select("#nodeTypeDiagramsRect").selectAll("rect")
                    .attr("stroke", "#c6c6c6")
                    .style("stroke-width", 1);
            });

        svg.attr("height", Math.max(height, maxHeight));
        d3.select("#tooltipMiniIntra").raise();
    }//end drawRealMiniIntraDiagram function

    render(){
        console.log("Rendering for RealMiniIntraDiagram")
      
        return <div id={this.props.id} ref={this.chartRef} ></div>
    }//end render
}//end class

export default RealMiniIntraDiagram;