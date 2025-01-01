import React from 'react';
import * as d3 from "d3";

class RealMiniInterDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("In consructor of RealMiniInterDiagram");
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructo

    componentDidMount(){
        console.log("In componenet did mount for RealMiniInterDiagram");

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawRealMiniInterDiagram();
        })

        d3.select('#root').append('div')
        .attr("class", "tt")
        .attr("id", "tooltipMiniInter")

        window.addEventListener("resize", this.redrawChart);
    }//end componentDidMount

    
    componentDidUpdate(prevProps, prevState){
        console.log("in component did update for realminiinterdiagram ", this.props);
        if(prevProps.selectedTreeName !== this.props.selectedTreeName){
            if(this.props.selectedTreeName !== null){
                console.log("Change for real mini inter diagram selected tree", this.props.selectedTreeName);
                const divId = '#'+ this.props.id;
                let myDuration = 1500;
                
                this.drawRealMiniInterDiagram = this.drawRealMiniInterDiagram.bind(this);
                let ss = this.drawRealMiniInterDiagram;
    
                setTimeout(function(){
                    d3.select(divId).select("#realMiniInterSVG").remove();
                    d3.select('#root').select("#tooltipMiniInter").select(".content").remove();
                    d3.select('#root').select("#tooltipMiniInter").select(".tail").remove();
                    ss();
                }, myDuration)
            }
        }else if((prevProps.selectedEdgeNamesInterFilter !== this.props.selectedEdgeNamesInterFilter)
        || (prevProps.selectedNodeNamesInterFilter !== this.props.selectedNodeNamesInterFilter)
        || (prevProps.selectedNodeTypesInterFilter !== this.props.selectedNodeTypesInterFilter)
        || (prevProps.selectedDirectionInterFilter !== this.props.selectedDirectionInterFilter)){
            const selectedEdgeNamesInterFilter =this.props.selectedEdgeNamesInterFilter;
            const selectedNodeNamesInterFilter = this.props.selectedNodeNamesInterFilter;
            const selectedNodeTypesInterFilter = this.props.selectedNodeTypesInterFilter;
            const selectedDirectionInterFilter = this.props.selectedDirectionInterFilter;

            const selectedTreeInterData = this.getSelectedTreeInterData(this.props.treesInterData, this.props.selectedTreeName);
            const selectedTreeName = this.props.selectedTreeName;
            let filteredTreeInterData = [];

            for(let i = 0; i < selectedTreeInterData.length; i++){
                let filterEdge = false;

                if(selectedEdgeNamesInterFilter.length !== 0 || selectedNodeNamesInterFilter.length !== 0 || selectedNodeTypesInterFilter.length !== 0 || selectedDirectionInterFilter !== null){
                    if(selectedEdgeNamesInterFilter.length === 0){
                        filterEdge = true;
                    }else{
                        for(let j = 0; j < selectedEdgeNamesInterFilter.length; j++){
                            if(selectedEdgeNamesInterFilter[j].value === selectedTreeInterData[i].edgeType){
                                filterEdge=true;
                                break;
                            }
                        }
                    }

                    if(filterEdge && selectedNodeNamesInterFilter.length === 0){
                        filterEdge = true;
                    }else if(filterEdge){
                        filterEdge  = false;
                        for(let j = 0; j < selectedNodeNamesInterFilter.length; j++){
                            if(selectedTreeName === selectedTreeInterData[i].startTree && 
                            selectedNodeNamesInterFilter[j].value === selectedTreeInterData[i].startNode){
                                filterEdge = true;
                                break;
                            }else if(selectedTreeName === selectedTreeInterData[i].endTree &&
                            selectedNodeNamesInterFilter[j].value === selectedTreeInterData[i].endNode){
                                filterEdge = true;
                                break;
                            }
                        }
                    }

                    if(filterEdge && selectedNodeTypesInterFilter.length === 0){
                        filterEdge = true;
                    }else if(filterEdge){
                        filterEdge  = false;
                        for(let j = 0; j < selectedNodeTypesInterFilter.length; j++){
                            if(selectedTreeName === selectedTreeInterData[i].startTree && 
                                selectedNodeTypesInterFilter[j].value === selectedTreeInterData[i].startNodeType){
                                filterEdge = true;
                                break;
                            }else if(selectedTreeName === selectedTreeInterData[i].endTree &&
                                selectedNodeTypesInterFilter[j].value === selectedTreeInterData[i].endNodeType){
                                filterEdge = true;
                                break;
                            }
                        }

                    }

                    if(filterEdge && selectedDirectionInterFilter === null){
                        filterEdge = true;
                    }else if(filterEdge && selectedDirectionInterFilter.value !== undefined && selectedNodeNamesInterFilter.length !== 0 ){
                        filterEdge = false;

                        if(selectedDirectionInterFilter.value === "Either"){
                            filterEdge = true;
                        }else if(selectedDirectionInterFilter.value === "Outgoing"){
                            for(let j = 0; j < selectedNodeNamesInterFilter.length; j++){
                                if((selectedNodeNamesInterFilter[j].value === selectedTreeInterData[i].startNode)
                                && selectedTreeName === selectedTreeInterData[i].startTree){
                                    filterEdge=true;
                                    break;
                                }
                            }
                        }else{
                            for(let j = 0; j < selectedNodeNamesInterFilter.length; j++){
                                if((selectedNodeNamesInterFilter[j].value === selectedTreeInterData[i].endNode) &&
                                selectedTreeName === selectedTreeInterData[i].endTree){
                                    filterEdge=true;
                                    break;
                                }
                            }

                        }
                    }


                }else{
                    filterEdge = true;
                }

                if(filterEdge){
                    filteredTreeInterData.push(selectedTreeInterData[i]);
                }
            }//end for loop

            const divId = '#'+ this.props.id;
            d3.select(divId).select("svg").remove();
            d3.select('#root').select("#tooltipMiniInter").select("svg").remove();
            d3.select('#root').select("#tooltipMiniInter").select("div").remove();

            const height = this.state.height ;
            let width = this.state.width;
            let titleHeight = d3.select("#mini1Title").style("font-size");

            d3.select('#root').select("#tooltipMiniInter")
            .style('position', 'absolute').style('display', 'none');
            d3.select(divId).style("height", height + 'px')

            const svg = d3.select(divId).attr("class", "miniIntra").append('svg').attr("id", "realMiniInterSVG")
            .attr("width", width).attr("height", height*20)
            .style("border", "solid").style("border-color", "black").style("border-bottom", 0+'px');

            let groupedbyTrees = this.groupDatabyTrees(filteredTreeInterData, this.props.selectedTreeName)
            let groupedStartEndType = [];
    
            groupedbyTrees.forEach(function(d,i){
                let tempObj = {}
                tempObj.interTree = d[0];
                tempObj.startEndTypes = [];
    
                d[1].forEach(function(d2, i2){
                    if( tempObj.startEndTypes.length === 0){
                        let edgeObj = {};
                        edgeObj.startNodeType = d2.startNodeType;
                        edgeObj.endNodeType = d2.endNodeType;
                        edgeObj.edges = [];
    
                        let ee = {};
                        ee.edgeType = d2.edgeType;
                        ee.data = [];
                        ee.data.push(d2);
    
                        edgeObj.edges.push(ee);
                        tempObj.startEndTypes.push(edgeObj);
                    }else{
                        //Check if start/end exists
                        let startEndTypeFound = -1;
                        for(let j = 0; j <  tempObj.startEndTypes.length; j++){
                            if( tempObj.startEndTypes[j].startNodeType === d2.startNodeType 
                            && tempObj.startEndTypes[j].endNodeType === d2.endNodeType ){
                                startEndTypeFound = j;
                                break;
                            }//end if
                        }//end for loop
    
                        if(startEndTypeFound !== -1){
                            //Found start/end type now check edge type
                            let edgeFound = -1;
                            for(let k = 0; k < tempObj.startEndTypes[startEndTypeFound].edges.length; k++){
                                if( tempObj.startEndTypes[startEndTypeFound].edges[k].edgeType === d2.edgeType){
                                    edgeFound = k;
                                    break;
                                }//end if
                            }//end for loop
    
                            if(edgeFound !== -1){
                                //Edge already exists so add to array
                                tempObj.startEndTypes[startEndTypeFound].edges[edgeFound].data.push(d2);
                            }else{
                                //Edge not exist
                                let ee = {};
                                ee.edgeType = d2.edgeType;
                                ee.data = [];
                                ee.data.push(d2);
                                tempObj.startEndTypes[startEndTypeFound].edges.push(ee);
    
                            }
                        }else{
                            //Start/end type not exist
                            let edgeObj = {};
                            edgeObj.startNodeType = d2.startNodeType;
                            edgeObj.endNodeType = d2.endNodeType;
                            edgeObj.edges = [];
    
                            let ee = {};
                            ee.edgeType = d2.edgeType;
                            ee.data = [];
                            ee.data.push(d2);
    
                            edgeObj.edges.push(ee);
                            tempObj.startEndTypes.push(edgeObj);
                            //groupedStartEndType.push(tempObj);
                        }
                    }//end else
                    
                })//end for each
                groupedStartEndType.push(tempObj);
            })

             //sort edge names
            groupedStartEndType.forEach(function(d,i){
                d.startEndTypes.forEach(function(d2, i2){
                    if(d2.edges.length > 1){

                        groupedStartEndType[i].startEndTypes[i2].edges.sort(function(a,b){
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
                    }//end if
                })
            })

            //sort startnode type
            groupedStartEndType.forEach(function(d,i){
                d.startEndTypes.sort(function(a, b){

                    let aNumEdges = 0;
                    a.edges.forEach(function(d2,i2){
                        aNumEdges = aNumEdges + d2.data.length;
                    })

                    let bNumEdges = 0;
                    b.edges.forEach(function(d2,i2){
                        bNumEdges = bNumEdges + d2.data.length;
                    })

                    if(aNumEdges !== bNumEdges){
                        return (aNumEdges - bNumEdges)*-1;
                    }

                    let aStartType = a.startNodeType.toLowerCase();
                    let bStartType = b.startNodeType.toLowerCase();

                    if(aStartType < bStartType){
                        return -1;
                    }else if(bStartType < aStartType){
                        return 1;
                    }

                    let aEndType = a.endNodeType.toLowerCase();
                    let bEndType = b.endNodeType.toLowerCase();

                    if(aEndType < bEndType){
                        return -1;
                    }else if(bEndType < aEndType){
                        return 1;
                    }
                    return 0;
                })
            })

            let dataInterForD3 = [];

            groupedStartEndType.forEach(function(d,i){
                let arr = [];
                arr.push(d.interTree);
    
                arr.push([]);
    
                d.startEndTypes.forEach(function(d2,i2){
                    d2.edges.forEach(function(d4, i4){
                        let tempObj = {};
                        tempObj.startNodeType = d2.startNodeType;
                        tempObj.endNodeType = d2.endNodeType;
                        tempObj.edgeType = d4.edgeType;
                        tempObj.numEdges = d4.data.length;
                        tempObj.data = d4.data;
                        arr[1].push(tempObj);
                    })
                    
                })
                dataInterForD3.push(arr);
            })

            const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#ffffb3'];
            const color = d3.scaleOrdinal( )
            .domain(this.props.uniqueNodeTypesAllTrees)
            .range(colorSet);
            const margin = 5;
    
            svg.append('g').attr("id", "miniInterTitleNumber").append("text")
            .attr("x", 0 + margin) //Changes later
            .attr("y", parseFloat(titleHeight))
            .style("fill", "white")
            .style("font-size", titleHeight)
            .text("Total: " + filteredTreeInterData.length);

            const radius = (height - parseFloat(titleHeight) - margin)/3;
            const heightRect = (radius * 0.25) + radius;
            const scrollBarWidth = (width - svg.node().clientWidth)*2;
            let maxHeight = 0;
            let maxH = 0;

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

            d3.select('#root').select("#tooltipMiniInter").append("svg").attr("class", "tail")
                .style('position', 'absolute')
                .style('top', '0')
                .style('left', '0')
                .attr("width", "100%")
                .attr("height", "100%")
                .append("path")
                .attr("d",`M 0, 0 L 30, 40 L 40, 30 Z`)
                .attr("fill", "lightgray")
                .style("stroke", "black")
                
            d3.select('#root').select("#tooltipMiniInter").append("div")
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

            dataInterForD3.forEach(function(d4,i4){
                let yValue = 0;
                let textYValue = 0;
                let textValue =groupedbyTrees[i4][0] + ": " + groupedbyTrees[i4][1].length;
                maxHeight= maxH;
    
                if(i4 === 0){
                    let start = parseFloat(titleHeight) + margin;
                    yValue =  start;
                    textYValue =  start + parseFloat(titleHeight)
                }else{
                    let start =  maxHeight  + margin;
                    yValue =   start;
                    textYValue =  start + parseFloat(titleHeight);
                }
    
                let diagram = svg.append('g').attr("id", "nodeTypeDiagramsRect" + i4).attr("tree", d4[0])
                let borderRect = diagram.append("rect").attr("id", "#treeBorderRect")
                    .attr('x', 0 + margin)
                    .attr('y', yValue)
                    .attr('width', width - scrollBarWidth - margin*4)
                    .attr('height', heightRect)
                    .attr("fill", function(d){
                        //console.log("d.type ", d)
                        return "#d3d3d3"
                    })
                    .attr("stroke", "black")
    
                diagram.append("text")
                    .attr("x", 0 + margin*2) //Changes later
                    .attr("y", textYValue)
                    .style("fill", "black")
                    .style("font-size", titleHeight)
                    .text(textValue);
    
                let borderRectLength = 0;
    
                diagram.append('g').attr("id","nodeTypeDiagrams" + i4 + "Child").selectAll("rect").data(d4[1]).enter()
                    .append("rect")
                    .attr('x', 0 + margin*2)
                    .attr('y', function(d2, i2){
                        let start = textYValue + margin;
    
                        if(i2 === d4[1].length - 1){
                            borderRectLength = (i2*(heightRect+margin)) + heightRect + parseFloat(titleHeight) + margin*2;
                            maxH = yValue + borderRectLength;
                        }
                        return (i2*(heightRect+margin)) + start;
                    })
                    .attr('width', width - scrollBarWidth - margin*6)
                    .attr('height', heightRect)
                    .attr("fill", function(d){
                        return "white"
                    })
                    .attr("stroke", "#c6c6c6")
                    .on("mouseover", function(event,d){
                        console.log("rect inter hovered ", d);
                        d3.select('#root').select("#tooltipMiniInter").style('display', 'inline');
    
                        let coords = d3.pointer( event,  d3.select('.colContainer').node());
                        let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                        let midHeight = leftSideWidth.height / 2;
                        let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];
    
                        d3.select('#root').select("#tooltipMiniInter").select('.tail').select('path')
                        .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");
                        d3.select('#root').select("#tooltipMiniInter").select(".content")
                        .style('margin-left', (firstPoint[0]) +'px');
                        d3.select('#root').select("#tooltipMiniInter").select(".content").append("div").style("padding", "5px");
    
                        let table = d3.select('#root').select("#tooltipMiniInter").select(".content").select("div").append("table");
                        let header = table.append("thead").append("tr");
    
                        header.selectAll("th")
                            .data(["Start Tree", "Start Node", "End Tree", "End Node"])
                            .enter()
                            .append("th")
                            .text(function(d){
                                return d;
                            })
    
                        let rowArray = [];
                        d.data.forEach(function(d2,i2){
                            rowArray.push([d2.startTree, d2.startNode, d2.endTree, d2.endNode])
                        })
    
                        rowArray.sort(function(a,b){
                            let aStartTree = a[0].toLowerCase();
                            let bStartTree = b[0].toLowerCase();
    
                            if(aStartTree < bStartTree){
                                return -1;
                            }else if(bStartTree < aStartTree){
                                return 1;
                            }
    
                            let aEndTree = a[2].toLowerCase();
                            let bEndTree = b[2].toLowerCase();
                            if(aEndTree < bEndTree){
                                return -1;
                            }else if(bEndTree < aEndTree){
                                return 1;
                            }
    
                            let aStartNode = a[1].toLowerCase();
                            let bStartNode = b[1].toLowerCase();
                            if(aStartNode < bStartNode){
                                return -1;
                            }else if(bStartNode < aStartNode){
                                return 1;
                            }
    
                            let aEndNode = a[3].toLowerCase();
                            let bEndNode = b[3].toLowerCase();
                            if(aEndNode < bEndNode){
                                return -1;
                            }else if(bEndNode < aEndNode){
                                return 1;
                            }
    
                            return 0;
    
    
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
                                .data(function(d2) {
                                    return d2;
                                })
                                .enter()
                                .append("td")
                                .text(function(d2) {
                                    return d2;
                                });
                        
    
                        d3.select('#root').select("#tooltipMiniInter").style("left", ( coords[0]) + "px")
                        .style("top", (coords[1]) + "px");
                        
                        let toolTipHeight =  d3.select('#root').select("#tooltipMiniInter").select(".content").node().getBoundingClientRect().height;
                        d3.select('#root').select("#tooltipMiniInter").select(".content")
                        .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                        d3.select('#root').select("#tooltipMiniInter").style("height", (0) + 'px')
                        d3.select('#root').select("#tooltipMiniInter").select('.tail').attr("height", ((firstPoint[1]*-1) + 10))
                        d3.select('#root').select("#tooltipMiniInter").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                        d3.select('#root').select("#tooltipMiniInter").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");
    
                        let rectId = "nodeTypeDiagrams" + i4 + "Child";
                        // //Highlight rect
                        diagram.select("#" + rectId).selectAll("rect")
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
                        let rectId = "nodeTypeDiagrams" + i4 + "Child";
                        d3.select('#root').select("#tooltipMiniInter").style('display', 'none');
                        d3.select('#root').select("#tooltipMiniInter").select(".content").select("div").remove();
                        diagram.select("#" + rectId).selectAll("rect")
                            .attr("stroke", "#c6c6c6")
                            .style("stroke-width", 1);
                    })
    
    
                borderRect
                    .attr("height", borderRectLength );
    
                diagram.append('g').attr("id", "nodeTypeDiagramsStartCircles"+i4).selectAll("circles").data(d4[1]).enter().append("circle")
                    .attr("r", radius/2)
                    .attr("cx", radius/2 + margin*2 + ((radius * 0.25)/2))
                    .attr("cy", function(d,i){
                        let start = textYValue + margin + radius/2;
                        let rectMargin = ((radius * 0.25)/2)
                        let returnValue = i * (heightRect+margin) + start + rectMargin;
                        return returnValue;
                    })
                    .style("fill", function(d,i){
                        return color(d.startNodeType);
                    })
                    .style("stroke", "black")
    
                diagram.append('g').attr("id", "nodeTypeDiagramsEndCircles"+i4).selectAll("circles").data(d4[1]).enter().append("circle")
                    .attr("r", radius/2)
                    .attr("cx", (width - scrollBarWidth - margin*6)- (radius/2  + ((radius * 0.25)/2)) + margin*2)
                    .attr("cy", function(d,i){
                        let start = textYValue + margin + radius/2;
                        let rectMargin = ((radius * 0.25)/2)
                        let returnValue = i * (heightRect+margin) + start + rectMargin;
                        return returnValue;
                    })
                    .style("fill", function(d,i){
                        return color(d.endNodeType);
                    })
                    .style("stroke", "black")
    
                diagram.append('g').attr("id", "nodeTypeDiagramsEdges"+i4).selectAll("line").data(d4[1]).enter().append("line")
                    .attr("x1", radius + margin*2 + ((radius * 0.25)/2) )
                    .attr("x2", (width - scrollBarWidth - margin*6)- (radius  + ((radius * 0.25)/2)) + margin*2 -5)
                    .attr("y1", function(d, i){
                        let start = textYValue + margin + radius/2;
                        let rectMargin = ((radius * 0.25)/2)
                        let returnValue = i * (heightRect+margin) + start + rectMargin;
                            
                        return returnValue;
                    })
                    .attr("y2", function(d,i){
                        let start = textYValue + margin + radius/2;
                        let rectMargin = ((radius * 0.25)/2)
                        let returnValue = i * (heightRect+margin) + start + rectMargin;
    
                        return returnValue
                    })
                    .attr("stroke", "black")
                    .attr('marker-end', 'url(#arrow)')
    
                diagram.append('g').attr("id", "nodeTypeDiagramsNumEdges"+i4).selectAll("text").data(d4[1]).enter().append("text")
                    .attr("x", ((width - scrollBarWidth - margin*4)/2) + margin) 
                    .attr("y", function(d,i){
                        let start = textYValue + margin;
                            
                        return (i*(heightRect+margin)) + start + (heightRect/2) - parseFloat(titleHeight)/4;
                    })
                    .style("fill", "black")
                    .attr("text-anchor", "middle")
                    .style("font-size", titleHeight)
                    .text(function(d){
                        return d.numEdges;
                    });
    
                diagram.append('g').attr("id", "nodeTypeDiagramsEdgeType"+i4).selectAll("text").data(d4[1]).enter().append("text")
                    .attr("x", ((width - scrollBarWidth - margin*4)/2) + margin) 
                    .attr("y", function(d,i){
                        let start = textYValue + margin + parseFloat(titleHeight);
                            
                        return (i*(heightRect+margin)) + start + (heightRect/2);
                    })
                    .style("fill", "black")
                    .attr("text-anchor", "middle")
                    .style("font-size", titleHeight)
                    .text(function(d){
                        return d.edgeType;
                    });
            })
            

            svg.attr("height", Math.max(height, maxH + margin*2));
            d3.select("#tooltipMiniInter").raise();
        }//end else if
    }//end component did update

    componentWillUnmount(){
        window.removeEventListener("resize", this.redrawChart, false);
        d3.select('#root').select("#tooltipMiniInter").remove();
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
        //Gets and resets the height and width
        console.log("redraw RealMiniInterDiagram");
        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();

        //Redraw the direct chord diagram
        this.drawRealMiniInterDiagram = this.drawRealMiniInterDiagram.bind(this);
        this.drawRealMiniInterDiagram();
    }//end redrawChart function

    //Get the inter data given name
    getSelectedTreeInterData(data, name){
        let index = -1;
        for(let i = 0; i < data.length; i++){
            if(data[i][0].jsonTree === name){
                index = i;
                break;
            }
        }

        if(index === -1){
            return [];
        }else{
            return data[index];
        }
    }

    groupDatabyTrees(data, name){
        let res = {};

        for(let i = 0; i < data.length; i++){
            if(res === {}){
                if(data[i].startTree !== name){
                    res[data[i].startTree] = [];
                    res[data[i].startTree].push(data[i])
                }else{
                    res[data[i].endTree] = [];
                    res[data[i].endTree].push(data[i])
                }
            }else if(data[i].startTree !== name){
                if(Object.keys(res).includes(data[i].startTree)){
                    res[data[i].startTree].push(data[i]);
                }else{
                    res[data[i].startTree] = [];
                    res[data[i].startTree].push(data[i])
                }
            }else if(data[i].endTree !== name){
                if(Object.keys(res).includes(data[i].endTree)){
                    res[data[i].endTree].push(data[i]);
                }else{
                    res[data[i].endTree] = [];
                    res[data[i].endTree].push(data[i])
                }
            }
        }

        let resArr = [];

        Object.keys(res).forEach(function(d,i){
            resArr.push([d, res[d]])
        })

        resArr.sort(function(a,b){
            return b[1].length - a[1].length;
        })

        return resArr;
    }

    drawRealMiniInterDiagram(){
        console.log("In drawRealMiniInterDiagram", this.props);

        const divId = '#'+ this.props.id;
        const height = this.state.height ;
        let width = this.state.width;
        let titleHeight = d3.select("#mini1Title").style("font-size");
        d3.select('#root').select("#tooltipMiniInter")
        .style('position', 'absolute').style('display', 'none');

        d3.select(divId).style("height", height + 'px')

        const svg = d3.select(divId).attr("class", "miniIntra").append('svg').attr("id", "realMiniInterSVG")
        .attr("width", width).attr("height", height*20)
        .style("border", "solid").style("border-color", "black").style("border-bottom", 0+'px');

        const selectedTreeInterData = this.getSelectedTreeInterData(this.props.treesInterData, this.props.selectedTreeName);

        //Group data by trees
        let groupedbyTrees = this.groupDatabyTrees(selectedTreeInterData, this.props.selectedTreeName)
        let groupedStartEndType = [];

        groupedbyTrees.forEach(function(d,i){
            let tempObj = {}
            tempObj.interTree = d[0];
            tempObj.startEndTypes = [];

            d[1].forEach(function(d2, i2){
                if( tempObj.startEndTypes.length === 0){
                    let edgeObj = {};
                    edgeObj.startNodeType = d2.startNodeType;
                    edgeObj.endNodeType = d2.endNodeType;
                    edgeObj.edges = [];

                    let ee = {};
                    ee.edgeType = d2.edgeType;
                    ee.data = [];
                    ee.data.push(d2);

                    edgeObj.edges.push(ee);
                    tempObj.startEndTypes.push(edgeObj);
                }else{
                    //Check if start/end exists
                    let startEndTypeFound = -1;
                    for(let j = 0; j <  tempObj.startEndTypes.length; j++){
                        if( tempObj.startEndTypes[j].startNodeType === d2.startNodeType 
                        && tempObj.startEndTypes[j].endNodeType === d2.endNodeType ){
                            startEndTypeFound = j;
                            break;
                        }//end if
                    }//end for loop

                    if(startEndTypeFound !== -1){
                        //Found start/end type now check edge type
                        let edgeFound = -1;
                        for(let k = 0; k < tempObj.startEndTypes[startEndTypeFound].edges.length; k++){
                            if( tempObj.startEndTypes[startEndTypeFound].edges[k].edgeType === d2.edgeType){
                                edgeFound = k;
                                break;
                            }//end if
                        }//end for loop

                        if(edgeFound !== -1){
                            //Edge already exists so add to array
                            tempObj.startEndTypes[startEndTypeFound].edges[edgeFound].data.push(d2);
                        }else{
                            //Edge not exist
                            let ee = {};
                            ee.edgeType = d2.edgeType;
                            ee.data = [];
                            ee.data.push(d2);
                            tempObj.startEndTypes[startEndTypeFound].edges.push(ee);

                        }
                    }else{
                        //Start/end type not exist
                        let edgeObj = {};
                        edgeObj.startNodeType = d2.startNodeType;
                        edgeObj.endNodeType = d2.endNodeType;
                        edgeObj.edges = [];

                        let ee = {};
                        ee.edgeType = d2.edgeType;
                        ee.data = [];
                        ee.data.push(d2);

                        edgeObj.edges.push(ee);
                        tempObj.startEndTypes.push(edgeObj);
                    }
                }//end else
                
            })//end for each
            groupedStartEndType.push(tempObj);
        })

        //sort edge names
        groupedStartEndType.forEach(function(d,i){

            d.startEndTypes.forEach(function(d2, i2){
                if(d2.edges.length > 1){

                    groupedStartEndType[i].startEndTypes[i2].edges.sort(function(a,b){
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
                }//end if
            })
        })

        //sort startnode type
       groupedStartEndType.forEach(function(d,i){
           d.startEndTypes.sort(function(a, b){

            let aNumEdges = 0;
            a.edges.forEach(function(d2,i2){
                aNumEdges = aNumEdges + d2.data.length;
            })

            let bNumEdges = 0;
            b.edges.forEach(function(d2,i2){
                bNumEdges = bNumEdges + d2.data.length;
            })

            if(aNumEdges !== bNumEdges){
                return (aNumEdges - bNumEdges)*-1;
            }

            let aStartType = a.startNodeType.toLowerCase();
            let bStartType = b.startNodeType.toLowerCase();

            if(aStartType < bStartType){
                return -1;
            }else if(bStartType < aStartType){
                return 1;
            }

            let aEndType = a.endNodeType.toLowerCase();
            let bEndType = b.endNodeType.toLowerCase();

            if(aEndType < bEndType){
                return -1;
            }else if(bEndType < aEndType){
                return 1;
            }
            return 0;
        })
       })

        let dataInterForD3 = [];
        groupedStartEndType.forEach(function(d,i){
            let arr = [];
            arr.push(d.interTree);

            arr.push([]);

            d.startEndTypes.forEach(function(d2,i2){
                d2.edges.forEach(function(d4, i4){
                    let tempObj = {};
                    tempObj.startNodeType = d2.startNodeType;
                    tempObj.endNodeType = d2.endNodeType;
                    tempObj.edgeType = d4.edgeType;
                    tempObj.numEdges = d4.data.length;
                    tempObj.data = d4.data;
                    arr[1].push(tempObj);
                })
                
            })
            dataInterForD3.push(arr);
        })

        const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494', '#ffffb3'];
        const color = d3.scaleOrdinal( )
        .domain(this.props.uniqueNodeTypesAllTrees)
        .range(colorSet);
        const margin = 5;

        svg.append('g').attr("id", "miniInterTitleNumber").append("text")
        .attr("x", 0 + margin) //Changes later
        .attr("y", parseFloat(titleHeight))
        .style("fill", "white")
        .style("font-size", titleHeight)
        .text("Total: " + selectedTreeInterData.length);

        const radius = (height - parseFloat(titleHeight) - margin)/3;
        const heightRect = (radius * 0.25) + radius;
        const scrollBarWidth = (width - svg.node().clientWidth)*2;
        let maxHeight = 0;
        let maxH = 0;

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

        d3.select('#root').select("#tooltipMiniInter").append("svg").attr("class", "tail")
            .style('position', 'absolute')
            .style('top', '0')
            .style('left', '0')
            .attr("width", "100%")
            .attr("height", "100%")
            .append("path")
            .attr("d",`M 0, 0 L 30, 40 L 40, 30 Z`)
            .attr("fill", "lightgray")
            .style("stroke", "black")
    
        d3.select('#root').select("#tooltipMiniInter").append("div")
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

        dataInterForD3.forEach(function(d4,i4){
            let yValue = 0;
            let textYValue = 0;
            let textValue =groupedbyTrees[i4][0] + ": " + groupedbyTrees[i4][1].length;
            maxHeight= maxH;

            if(i4 === 0){
                let start = parseFloat(titleHeight) + margin;
                yValue =  start;
                textYValue =  start + parseFloat(titleHeight)
            }else{
                let start =  maxHeight  + margin;
                yValue =   start;
                textYValue =  start + parseFloat(titleHeight);
            }

            let diagram = svg.append('g').attr("id", "nodeTypeDiagramsRect" + i4).attr("tree", d4[0])

            let borderRect = diagram.append("rect").attr("id", "#treeBorderRect")
                .attr('x', 0 + margin)
                .attr('y', yValue)
                .attr('width', width - scrollBarWidth - margin*4)
                .attr('height', heightRect)
                .attr("fill", function(d){
                    return "#d3d3d3"
                })
                .attr("stroke", "black")

            diagram.append("text")
                .attr("x", 0 + margin*2) //Changes later
                .attr("y", textYValue)
                .style("fill", "black")
                .style("font-size", titleHeight)
                .text(textValue);

            let borderRectLength = 0;

            diagram.append('g').attr("id","nodeTypeDiagrams" + i4 + "Child").selectAll("rect").data(d4[1]).enter()
                .append("rect")
                .attr('x', 0 + margin*2)
                .attr('y', function(d2, i2){
                    let start = textYValue + margin;

                    if(i2 === d4[1].length - 1){
                        borderRectLength = (i2*(heightRect+margin)) + heightRect + parseFloat(titleHeight) + margin*2;
                        maxH = yValue + borderRectLength;
                    }
                    return (i2*(heightRect+margin)) + start;
                })
                .attr('width', width - scrollBarWidth - margin*6)
                .attr('height', heightRect)
                .attr("fill", function(d){
                    return "white"
                })
                .attr("stroke", "#c6c6c6")
                .on("mouseover", function(event,d){
                    console.log("rect inter hovered ", d);
                    d3.select('#root').select("#tooltipMiniInter").style('display', 'inline');

                    let coords = d3.pointer( event,  d3.select('.colContainer').node());
                    let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                    let midHeight = leftSideWidth.height / 2;
                    let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                    d3.select('#root').select("#tooltipMiniInter").select('.tail').select('path')
                    .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + (firstPoint[1]) + " L " + (firstPoint[0] + 10) + ", " + ((firstPoint[1]*1) + 10) + " Z");
                    d3.select('#root').select("#tooltipMiniInter").select(".content")
                    .style('margin-left', (firstPoint[0]) +'px');
                    d3.select('#root').select("#tooltipMiniInter").select(".content").append("div").style("padding", "5px");

                    let table = d3.select('#root').select("#tooltipMiniInter").select(".content").select("div").append("table");
                    let header = table.append("thead").append("tr");

                    header.selectAll("th")
                        .data(["Start Tree", "Start Node", "End Tree", "End Node"])
                        .enter()
                        .append("th")
                        .text(function(d){
                            return d;
                        })

                    let rowArray = [];
                    d.data.forEach(function(d2,i2){
                        rowArray.push([d2.startTree, d2.startNode, d2.endTree, d2.endNode])
                    })

                    rowArray.sort(function(a,b){
                        let aStartTree = a[0].toLowerCase();
                        let bStartTree = b[0].toLowerCase();

                        if(aStartTree < bStartTree){
                            return -1;
                        }else if(bStartTree < aStartTree){
                            return 1;
                        }

                        let aEndTree = a[2].toLowerCase();
                        let bEndTree = b[2].toLowerCase();
                        if(aEndTree < bEndTree){
                            return -1;
                        }else if(bEndTree < aEndTree){
                            return 1;
                        }

                        let aStartNode = a[1].toLowerCase();
                        let bStartNode = b[1].toLowerCase();
                        if(aStartNode < bStartNode){
                            return -1;
                        }else if(bStartNode < aStartNode){
                            return 1;
                        }

                        let aEndNode = a[3].toLowerCase();
                        let bEndNode = b[3].toLowerCase();
                        if(aEndNode < bEndNode){
                            return -1;
                        }else if(bEndNode < aEndNode){
                            return 1;
                        }

                        return 0;
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
                            .data(function(d2) {
                                return d2;
                            })
                            .enter()
                            .append("td")
                            .text(function(d2) {
                                return d2;
                            });
                    

                    d3.select('#root').select("#tooltipMiniInter").style("left", ( coords[0]) + "px")
                    .style("top", (coords[1]) + "px");

                    if(d3.select('#root').select("#tooltipMiniInter").select(".content").node() === null){
                        console.log("NULLL here ");
                    }
                    
                    let toolTipHeight =  d3.select('#root').select("#tooltipMiniInter").select(".content").node().getBoundingClientRect().height;
                    d3.select('#root').select("#tooltipMiniInter").select(".content")
                    .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) + 5) + "px");
                    d3.select('#root').select("#tooltipMiniInter").style("height", (0) + 'px')
                    d3.select('#root').select("#tooltipMiniInter").select('.tail').attr("height", ((firstPoint[1]*-1) + 10))
                    d3.select('#root').select("#tooltipMiniInter").select('.tail').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*1) - 10) + ")");
                    d3.select('#root').select("#tooltipMiniInter").select('.tail').select('path').attr("transform", "translate(" + 0 +", "+ ((firstPoint[1]*-1) + 10) + ")");

                    let rectId = "nodeTypeDiagrams" + i4 + "Child";
                    // //Highlight rect
                    diagram.select("#" + rectId).selectAll("rect")
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
                    let rectId = "nodeTypeDiagrams" + i4 + "Child";
                    d3.select('#root').select("#tooltipMiniInter").style('display', 'none');
                    d3.select('#root').select("#tooltipMiniInter").select(".content").select("div").remove();
                    diagram.select("#" + rectId).selectAll("rect")
                        .attr("stroke", "#c6c6c6")
                        .style("stroke-width", 1);
                })

            borderRect
                .attr("height", borderRectLength );

            diagram.append('g').attr("id", "nodeTypeDiagramsStartCircles"+i4).selectAll("circles").data(d4[1]).enter().append("circle")
                .attr("r", radius/2)
                .attr("cx", radius/2 + margin*2 + ((radius * 0.25)/2))
                .attr("cy", function(d,i){
                    let start = textYValue + margin + radius/2;
                    let rectMargin = ((radius * 0.25)/2)
                    let returnValue = i * (heightRect+margin) + start + rectMargin;
                    return returnValue;
                })
                .style("fill", function(d,i){
                    return color(d.startNodeType);
                })
                .style("stroke", "black")

            diagram.append('g').attr("id", "nodeTypeDiagramsEndCircles"+i4).selectAll("circles").data(d4[1]).enter().append("circle")
                .attr("r", radius/2)
                .attr("cx", (width - scrollBarWidth - margin*6)- (radius/2  + ((radius * 0.25)/2)) + margin*2)
                .attr("cy", function(d,i){
                    let start = textYValue + margin + radius/2;
                    let rectMargin = ((radius * 0.25)/2)
                    let returnValue = i * (heightRect+margin) + start + rectMargin;
                    return returnValue;
                })
                .style("fill", function(d,i){
                    return color(d.endNodeType);
                })
                .style("stroke", "black")

            diagram.append('g').attr("id", "nodeTypeDiagramsEdges"+i4).selectAll("line").data(d4[1]).enter().append("line")
                .attr("x1", radius + margin*2 + ((radius * 0.25)/2) )
                .attr("x2", (width - scrollBarWidth - margin*6)- (radius  + ((radius * 0.25)/2)) + margin*2 -5)
                .attr("y1", function(d, i){
                    let start = textYValue + margin + radius/2;
                    let rectMargin = ((radius * 0.25)/2)
                    let returnValue = i * (heightRect+margin) + start + rectMargin;
                        
                    return returnValue;
                })
                .attr("y2", function(d,i){
                    let start = textYValue + margin + radius/2;
                    let rectMargin = ((radius * 0.25)/2)
                    let returnValue = i * (heightRect+margin) + start + rectMargin;

                    return returnValue
                })
                .attr("stroke", "black")
                .attr('marker-end', 'url(#arrow)')

            diagram.append('g').attr("id", "nodeTypeDiagramsNumEdges"+i4).selectAll("text").data(d4[1]).enter().append("text")
                .attr("x", ((width - scrollBarWidth - margin*4)/2) + margin) 
                .attr("y", function(d,i){
                    let start = textYValue + margin;
                        
                    return (i*(heightRect+margin)) + start + (heightRect/2) - parseFloat(titleHeight)/4;
                })
                .style("fill", "black")
                .attr("text-anchor", "middle")
                .style("font-size", titleHeight)
                .text(function(d){
                    return d.numEdges;
                });

            diagram.append('g').attr("id", "nodeTypeDiagramsEdgeType"+i4).selectAll("text").data(d4[1]).enter().append("text")
                .attr("x", ((width - scrollBarWidth - margin*4)/2) + margin) 
                .attr("y", function(d,i){
                    let start = textYValue + margin + parseFloat(titleHeight);
                        
                    return (i*(heightRect+margin)) + start + (heightRect/2);
                })
                .style("fill", "black")
                .attr("text-anchor", "middle")
                .style("font-size", titleHeight)
                .text(function(d){
                    return d.edgeType;
                });
        })
         svg.attr("height", Math.max(height, maxH + margin*2));
         d3.select("#tooltipMiniInter").raise();
    }//end drawRealMiniChordDiagram function

    render(){
        console.log("Rendering for RealMiniInterDiagram")
      
        return <div id={this.props.id} ref={this.chartRef} ></div>
    }//end render
}//end class

export default RealMiniInterDiagram;