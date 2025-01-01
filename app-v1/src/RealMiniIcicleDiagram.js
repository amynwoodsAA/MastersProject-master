import React from 'react';
import * as d3 from "d3";

class RealMiniIcicleDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of RealMiniIcicleDiagram");
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructo

    componentDidMount(){
        console.log("In component did mount for RealMiniIcicleDiagram");

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawRealMiniIcicleDiagram();
        })

        d3.select('#root').append('div')
        .attr("class", "tt")
        .attr("id", "tooltipMiniIcicle")

        window.addEventListener("resize", this.redrawChart);
    }//end componentDidMount

    componentDidUpdate(prevProps, prevState){
        console.log("In componenet did update for RealMiniIcicleDiagram", this.props, " prevProps", prevProps);

        //If the mini icicle tree changed or the big icicle tree changed
        if(prevProps.selectedMiniIcicleTreeName !== this.props.selectedMiniIcicleTreeName
            || prevProps.selectedTreeName !== this.props.selectedTreeName){
            
            ///If the mini icicle tree changed or the big icicle tree changed
            if(this.props.selectedMiniIcicleTreeName !== null && this.props.selectedTreeName !== null ){
                console.log("changed tree either mini  ", this.props.selectedMiniIcicleTreeName, " or ", this.props.selectedTreeName);
                const selectedTree = this.props.selectedMiniIcicleTreeName;
                const selectedEdgeType = this.props.selectedEdgeType;
                const divId = '#'+ this.props.id;
                let height = this.state.height ;
                let width = this.state.width;

                //Get the tree for the mini icicle
                const currentTreeData = this.getSelectedTreeData(selectedTree, this.props.treeData)

                if(currentTreeData === -1){
                    console.log("Error no tree in the data with ", selectedTree)
                    return;
                }

                const divSmall = 1.0;
                let originalWidth = this.state.width / divSmall;
                let originalHeight = this.state.height /divSmall;
        
                function zoomed({transform}) {
                    svg.attr("transform", transform);
                }
                
                let zoomTotal = d3.zoom()
                    .scaleExtent([1/4, 100])
                    .on("zoom", zoomed);

                let partition = d3.partition().size([width, height]).padding(2);
                let rootNode = d3.hierarchy(currentTreeData);
                rootNode.count()
                partition(rootNode);

                //Get the min height and width for the tree for the mini icicle
                //Must be able to fit a circle of radius value
                let radius = 5;
                let fixers = [];
                let fixersY = [];

                (rootNode.descendants()).forEach(function(d){
                    if(d.x1 - d.x0 < radius * 2.5){
                        fixers.push(d);
                    }//end if
                    if(d.y1 - d.y0 < radius * 2.5){
                        fixersY.push(d);
                    }//end if
                })

                while(fixers.length > 0 || fixersY.length > 0){

                    if(fixers.length > 0){
                        width = width + 1;
                        d3.select(divId).select("#realMiniIcicleSVG").attr("width", width);
                    }//end if
                    if(fixersY.length > 0){
                        height = height + 1;
                        //d3.select(divId).select("#realMiniIcicleSVG").attr("height", height);
                    }//end if
                    partition = d3.partition().size([width, height]).padding(2)
                    partition(rootNode);
            
                    fixers = [];
                    fixersY = [];
            
                    (rootNode.descendants()).forEach(function(d){
                        if(d.x1 - d.x0 < radius * 2.5){
                            fixers.push(d);
                        }
                        if(d.y1 - d.y0 < radius *2.5){
                            fixersY.push(d);
                        }
                    })
                }//end while

                const nodeTypes = this.props.uniqueNodeTypesAllTrees;
                const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#ffffb3'];
                const color = d3.scaleOrdinal( )
                .domain(nodeTypes)
                .range(colorSet);

                //Get inter data between main area tree and mini icicle tree
                const treesInterData = this.props.treesInterData;
                const filteredData = this.filterTreesInterData(treesInterData, this.props.selectedTreeName, this.props.selectedMiniIcicleTreeName);

                //Get the mini tree intra data
                const selectedTreeIntraData = this.getSelectedTreeIntraData(this.props.treeIntraData, this.props.selectedMiniIcicleTreeName);
                let treeIntraDataFormatted = [];
                for(let i = 0; i < selectedTreeIntraData.length; i++){
                    let obj1 = {};
                    obj1.source = selectedTreeIntraData[i].startNodeID;
                    obj1.target = selectedTreeIntraData[i].endNodeID;
                    obj1.edgeType= selectedTreeIntraData[i].edgeType;
                    treeIntraDataFormatted.push(obj1);
                }//end for loop
        
                // Get the number of edges per node for mini icicle tree
                let edgesPerNode = {};
                treeIntraDataFormatted.forEach(function(d2,i2){
                       
                    if(edgesPerNode[d2.source] === undefined){
                        edgesPerNode[d2.source] = [];
                        edgesPerNode[d2.source].push(d2);
                    }else{
                        edgesPerNode[d2.source].push(d2);
                    } 
                    
                    if(edgesPerNode[d2.target] === undefined){
                        edgesPerNode[d2.target] = [];
                        edgesPerNode[d2.target].push(d2);
                    }else{
                        edgesPerNode[d2.target].push(d2);
                    } 
        
                })

                // Get the mini tree inter data
                let treeInterData = this.getSelectedTreeInterData(this.props.treesInterData, this.props.selectedMiniIcicleTreeName);
                // Get number of inter edges per node for mini icicle tree
                let edgesPerNodeInter = {};
                treeInterData.forEach(function(d,i){
        
                    if(d.startTree === selectedTree && edgesPerNodeInter[d.startNodeID] === undefined){
                        edgesPerNodeInter[d.startNodeID] = [];
                        edgesPerNodeInter[d.startNodeID].push(d);
                    }else if(d.startTree === selectedTree ){
                        edgesPerNodeInter[d.startNodeID].push(d);
                    } 
                    
                    if(d.endTree === selectedTree && edgesPerNodeInter[d.endNodeID] === undefined){
                        edgesPerNodeInter[d.endNodeID] = [];
                        edgesPerNodeInter[d.endNodeID].push(d);
                    }else if(d.endTree === selectedTree){
                        edgesPerNodeInter[d.endNodeID].push(d);
                    } 
        
                })


                d3.select(divId).select("#realMiniIcicleSVG").select("#treeMiniIcicleG").remove();
                d3.select(divId).select("#realMiniIcicleSVG").call(zoomTotal).append('g').attr("id", "treeMiniIcicleG");
                let svg = d3.select(divId).select("#realMiniIcicleSVG").select("#treeMiniIcicleG");

                let getInterDataFunc = this.getSelectedTreeInterData;
                let getIntraDataFunc = this.getSelectedTreeIntraData;
                let treeIntraData = this.props.treeIntraData;
                let treeInterData2 = this.props.treesInterData;

                //Icicle Part
                svg.append('g')
                .selectAll('rect')
                .data(rootNode.descendants())
                .enter()
                .append('rect')
                .attr('x', function(d) { return d.x0; })
                .attr('y', function(d) { return d.y0; })
                .attr('width', function(d) { return d.x1 - d.x0; })
                .attr('height', function(d) { return d.y1 - d.y0; })
                .attr("fill", function(d){
                    return color(d.data.type)
                })
                .attr("stroke", function(d,i){
    
                    if(selectedEdgeType.value === "Inter"){
                        for(let j = 0; j < filteredData.length; j++){
                            if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d.data.id ){
                                return "black"
                            } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d.data.id  ){
                                return "black"
                            }
                        }
                    }
    
                        return "#c6c6c6";
                })
                .attr("stroke-width", function(d){
                    if(selectedEdgeType.value === "Inter"){
                        for(let j = 0; j < filteredData.length; j++){
                            if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d.data.id ){
                                return 3
                            } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d.data.id  ){
                                return 3
                            }
                        }
                    }


                    return 1;
                })
                .on("mouseover", function(event,d){
                    console.log("component update mini icicle hovered voer ", d);
                    d3.select('#root').select("#tooltipMiniIcicle").style('display', 'inline');
                    
                    let coords = d3.pointer( event,  d3.select('.colContainer').node());
    
                    let edgesPerSelectedNode = edgesPerNode[d.data.id];
                    //console.log("edgesPerselect ", edgesPerSelectedNode);
                    
                    let outgoingEdges = 0;
                    let incomingEdges= 0;
                    let totalEdges = 0;
    
                    if(edgesPerSelectedNode !== undefined){
                        totalEdges = edgesPerSelectedNode.length
                        edgesPerSelectedNode.forEach(function(d2,i2){
                            if(d2.source === d.data.id){
                                outgoingEdges++;
                            }else{
                                incomingEdges++;
                            }
                        })
                    }
                    let edgesPerSelectedNodeInter= edgesPerNodeInter[d.data.id];

                    let outgoingEdgesInter = 0;
                    let incomingEdgesInter= 0;
                    let totalEdgesInter = 0;
    
                    if(edgesPerSelectedNodeInter !== undefined){
                        totalEdgesInter = edgesPerSelectedNodeInter.length
                        edgesPerSelectedNodeInter.forEach(function(d2,i2){
                            if(d2.startNodeID === d.data.id && d2.startTree === selectedTree){
                                outgoingEdgesInter++;
                            }else{
                                incomingEdgesInter++;
                            }
                        })
                    }

                    //get left col width
                    let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                    let midHeight = leftSideWidth.height / 2;
        
                    let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];
    
                    d3.select('#root').select("#tooltipMiniIcicle").select('.tail').select('path')
                        .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + firstPoint[1] + " L " + (firstPoint[0] + 10) + ", " + (firstPoint[1] - 10) + " Z");
    
                    d3.select('#root').select("#tooltipMiniIcicle").select(".content")
                    .style('margin-left', firstPoint[0] +'px');

                    //Get Inter data
                    const currentTreeInterData = getInterDataFunc(treeInterData2, selectedTree);
                    let numberInterEdges = 0;
                    currentTreeInterData.forEach(function(d2, i2){
                        //TO CHANGE TO ID
                        if(d2.startTree === selectedTree){
                            if(d2.startNodeID === d.data.id){
                                numberInterEdges++;
                            }
                        }else if(d2.endTree === selectedTree){
                            if(d2.endNodeID === d.data.id){
                                numberInterEdges++;
                            }
                        }
                    })

                    //Get INtra Data
                    const currentTreeIntraData = getIntraDataFunc(treeIntraData, selectedTree);
                    let numberIntraEdges = 0;
                    currentTreeIntraData.forEach(function(d2, i2){
                        //TO CHANGE TO ID
                        if(d2.startNodeID === d.data.id || d2.endNodeID === d.data.id){
                            numberIntraEdges++;
                        }
                    })

                    if(selectedEdgeType.value === "Inter"){
                        d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span>  " + d.data.name
                        + "<br/> <span class='tooltip-text-bold'>Node Type: </span> " + d.data.type
                        + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span>  " + totalEdgesInter
                        + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span>  " + incomingEdgesInter
                        + "<br/> <span class='tooltip-text-bold'># Outgoing Edges:</span>  " + outgoingEdgesInter)
                    }else if(selectedEdgeType.value === "Intra"){
                        d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span>  " + d.data.name
                        + "<br/> <span class='tooltip-text-bold'>Node Type:</span>  " + d.data.type
                        + "<br/> <span class='tooltip-text-bold'># Intra Edges: </span> " + totalEdges
                        + "<br/> <span class='tooltip-text-bold'># Incoming Edges: </span> " + incomingEdges
                        + "<br/> <span class='tooltip-text-bold'># Outgoing Edges: </span> " + outgoingEdges)
                    }else{
                        //console.log("hi there -------------------------------------------------")
                        d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span>  " + d.data.name
                        + "<br/> <span class='tooltip-text-bold'>Node Type:</span>  " + d.data.type
                        + "<br/> <span class='tooltip-text-bold'># Intra Edges:</span>  " + numberIntraEdges
                        + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span>  " + numberInterEdges)
                    }
    
                    
    
                    d3.select('#root').select("#tooltipMiniIcicle").style("left", ( coords[0]) + "px")
                    .style("top", (coords[1]) + "px");
                    
                    let toolTipHeight =  d3.select('#root').select("#tooltipMiniIcicle").select(".content").node().getBoundingClientRect().height;
                    d3.select('#root').select("#tooltipMiniIcicle").select(".content")
                    .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) - 5) + "px");
    
                    d3.select('#root').select("#tooltipMiniIcicle").style("height", firstPoint[1] + 'px')

                    if(selectedEdgeType.value === "Inter"){

                        svg.selectAll("rect").style("opacity", function(d2,i2){
                            //TODO: might change to id as there maybe be multiple same names
                            if(d2.data.id === d.data.id){
                                return 1;
                            }
                            return 0.3;
                        })
                        .attr("stroke", function(d2,i2){

                            //console.log("d2 ", d2.data);
            
                            for(let j = 0; j < filteredData.length; j++){
                                if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d2.data.id ){
                                    //console.log("here 111 ");
                                        return "black"
                                } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d2.data.id  ){
                                    //console.log("here 1221 ");
                                    return "black"
                                }
                            }

            
                            return "#c6c6c6";
                        })
                    }else{
                        svg.selectAll("rect").style("opacity", function(d2,i2){
                            //TODO: might change to id as there maybe be multiple same names
                            if(d2.data.id === d.data.id){
                                return 1;
                            }
                            return 0.3;
                        })
                        .attr("stroke", function(d2, i2){
                            if(d2.data.id === d.data.id){
                                return "black";
                            }
                            return "#c6c6c6";
                        })
                    }
    
    

    
                    svg.selectAll("circle").style("fill", function(d2,i2){
                        //TODO: might change to id as there maybe be multiple same names
                        if(d2.data.id === d.data.id){
                            return "black";
                        }
                        return "gray";
                    })
                })
                .on("mouseout", function(event,d){
                    console.log("goodbye", d.data);
                    d3.select('#root').select("#tooltipMiniIcicle").style('display', 'none');
                    svg.selectAll("rect").style("opacity", 1).attr("stroke", "#c6c6c6");


                    if(selectedEdgeType.value === "Inter"){
                        svg.selectAll("rect").attr("stroke", function(d2,i2){
            
                            for(let j = 0; j < filteredData.length; j++){
                                if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d2.data.id ){
                                    return "black"
                                } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d2.data.id  ){
                                    return "black"
                                }
                            }

            
                            return "#c6c6c6";
                        })
                    }
                    svg.selectAll("circle").style("fill", "black")
    
                })


                svg.append('g').selectAll("circle")
                    .data(rootNode.descendants())
                    .enter().append("circle")
                    .attr("r", radius)
                    .attr("cx", function(d) { 
                        return  (d.x0 + d.x1 )/ 2; 
                    } )
                    .attr("cy",  function(d) { 
                        return  ( d.y1 + d.y0 )/ 2; 
                    })
                    .style("fill", "black")

                var bounds2 = svg.node().getBBox();

                var fullWidth = originalWidth,
                    fullHeight =  originalHeight;
                var width2 = bounds2.width,
                    height2 = bounds2.height;

                //console.log("width2 ", fullWidth);

                var midX = bounds2.x + width2 / 2,
                midY = bounds2.y + height2 / 2;

                var paddingPercent = 0.95;
                var transitionDuration = 500;

                var scale1 = (paddingPercent) / Math.max(width2 / fullWidth, height2 / fullHeight);
                var translate1 = [fullWidth / 2 - scale1 * midX, fullHeight / 2 - scale1 * midY];

                    //Update min scale
                zoomTotal.scaleExtent([scale1, 100]);

                svg.transition()
                    .duration(transitionDuration)
                    .call(zoomTotal.transform,
                    d3.zoomIdentity.translate(translate1[0], translate1[1]).scale(scale1));

                //Fix inital zooming problem when try to zoom
                d3.select(divId).select("#realMiniIcicleSVG").call(zoomTotal.transform,
                d3.zoomIdentity.translate(translate1[0], translate1[1]).scale(scale1));

                d3.select(divId).select("#realMiniIcicleSVG").attr("width", fullWidth);

            }//end null if
            
        }//end if
        else if(prevProps.selectedEdgeType !== this.props.selectedEdgeType){
            console.log("realmini icicle changed edge type to ", this.props.selectedEdgeType);
            if(this.props.selectedTreeName !== null){
                const divId = '#'+ this.props.id;
                const treesInterData = this.props.treesInterData;
                const filteredData = this.filterTreesInterData(treesInterData, this.props.selectedTreeName, this.props.selectedMiniIcicleTreeName);
                const selectedTree = this.props.selectedMiniIcicleTreeName;
                const selectedEdgeType = this.props.selectedEdgeType;

                const selectedTreeIntraData = this.getSelectedTreeIntraData(this.props.treeIntraData, this.props.selectedMiniIcicleTreeName);
                let treeIntraDataFormatted = [];
                for(let i = 0; i < selectedTreeIntraData.length; i++){
                    //console.log("at ", i , ": ", this.props.treeIntraData[0][i]);
                    let obj1 = {};
                    obj1.source = selectedTreeIntraData[i].startNodeID;
                    obj1.target = selectedTreeIntraData[i].endNodeID;
                    obj1.edgeType= selectedTreeIntraData[i].edgeType;
                    treeIntraDataFormatted.push(obj1);
                }

                let edgesPerNode = {};
                treeIntraDataFormatted.forEach(function(d2,i2){
                    
                    if(edgesPerNode[d2.source] === undefined){
                        edgesPerNode[d2.source] = [];
                        edgesPerNode[d2.source].push(d2);
                    }else{
                        edgesPerNode[d2.source].push(d2);
                    } 
                    
                    if(edgesPerNode[d2.target] === undefined){
                        edgesPerNode[d2.target] = [];
                        edgesPerNode[d2.target].push(d2);
                    }else{
                        edgesPerNode[d2.target].push(d2);
                    } 

                })
                let treeInterData = this.getSelectedTreeInterData(this.props.treesInterData, this.props.selectedMiniIcicleTreeName);
                let edgesPerNodeInter = {};
                treeInterData.forEach(function(d,i){
        
                    if(d.startTree === selectedTree && edgesPerNodeInter[d.startNodeID] === undefined){
                        edgesPerNodeInter[d.startNodeID] = [];
                        edgesPerNodeInter[d.startNodeID].push(d);
                    }else if(d.startTree === selectedTree ){
                        edgesPerNodeInter[d.startNodeID].push(d);
                    } 
                    
                    if(d.endTree === selectedTree && edgesPerNodeInter[d.endNodeID] === undefined){
                        edgesPerNodeInter[d.endNodeID] = [];
                        edgesPerNodeInter[d.endNodeID].push(d);
                    }else if(d.endTree === selectedTree){
                        edgesPerNodeInter[d.endNodeID].push(d);
                    } 
        
                })

                let getInterDataFunc = this.getSelectedTreeInterData;
                let getIntraDataFunc = this.getSelectedTreeIntraData;
                let treeIntraData = this.props.treeIntraData;
                let treeInterData2 = this.props.treesInterData;

                // Draw rectangles
                let svg = d3.select(divId).select("#realMiniIcicleSVG").select("#treeMiniIcicleG");
                svg.selectAll("rect")
                    .attr("stroke", function(d,i){
                        // If the view is inter bold the rectangles that have edges with the main icicle
                        if(selectedEdgeType.value === "Inter"){
                            for(let j = 0; j < filteredData.length; j++){
                                if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d.data.id ){
                                    return "black"
                                } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d.data.id  ){
                                    return "black"
                                }
                            }//end for loop
                        }// end if

                        return "#c6c6c6";
                    })
                    .attr("stroke-width", function(d){
                        // If the view is inter bold the rectangles that have edges with the main icicle
                        if(selectedEdgeType.value === "Inter"){
                            for(let j = 0; j < filteredData.length; j++){
                                if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d.data.id ){
                                    return 3;
                                } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d.data.id  ){
                                    return 3;
                                }
                            }//end for loop
                        }//end if

                        return 1;
                    })
                    .on("mouseover", function(event,d){
                        console.log("realmini icicle changed edge type hovered voer ", d);
                        d3.select('#root').select("#tooltipMiniIcicle").style('display', 'inline');
                        
                        let coords = d3.pointer( event,  d3.select('.colContainer').node());
        
                        //Get number of intra edges 
                        let edgesPerSelectedNode = edgesPerNode[d.data.id];
                        let outgoingEdges = 0;
                        let incomingEdges= 0;
                        let totalEdges = 0;
                        if(edgesPerSelectedNode !== undefined){
                            totalEdges = edgesPerSelectedNode.length
                            edgesPerSelectedNode.forEach(function(d2,i2){
                                if(d2.source === d.data.id){
                                    outgoingEdges++;
                                }else{
                                    incomingEdges++;
                                }
                            })
                        }

                        //Get number of inter edges
                        let edgesPerSelectedNodeInter= edgesPerNodeInter[d.data.id];
                        let outgoingEdgesInter = 0;
                        let incomingEdgesInter= 0;
                        let totalEdgesInter = 0;
                        if(edgesPerSelectedNodeInter !== undefined){
                            totalEdgesInter = edgesPerSelectedNodeInter.length
                            edgesPerSelectedNodeInter.forEach(function(d2,i2){
                                if(d2.startNodeID === d.data.id && d2.startTree === selectedTree){
                                    outgoingEdgesInter++;
                                }else{
                                    incomingEdgesInter++;
                                }
                            })
                        }

                        //get left col width
                        let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                        let midHeight = leftSideWidth.height / 2;
                        let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];
        
                        // Draw a tooltip box with a tail
                        d3.select('#root').select("#tooltipMiniIcicle").select('.tail').select('path')
                            .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + firstPoint[1] + " L " + (firstPoint[0] + 10) + ", " + (firstPoint[1] - 10) + " Z");
                        d3.select('#root').select("#tooltipMiniIcicle").select(".content")
                        .style('margin-left', firstPoint[0] +'px');

                        //Get Inter data and number of inter edges
                        const currentTreeInterData = getInterDataFunc(treeInterData2, selectedTree);
                        let numberInterEdges = 0;
                        currentTreeInterData.forEach(function(d2, i2){
                            if(d2.startTree === selectedTree){
                                if(d2.startNodeID === d.data.id){
                                    numberInterEdges++;
                                }
                            }else if(d2.endTree === selectedTree){
                                if(d2.endNodeID === d.data.id){
                                    numberInterEdges++;
                                }
                            }
                        })

                        //Get Intra data and number of intra edges
                        const currentTreeIntraData = getIntraDataFunc(treeIntraData, selectedTree);
                        let numberIntraEdges = 0;
                        currentTreeIntraData.forEach(function(d2, i2){
                            if(d2.startNodeID === d.data.id || d2.endNodeID === d.data.id){
                                numberIntraEdges++;
                            }
                        })

                        //Fill the tooltip with content
                        if(selectedEdgeType.value === "Inter"){
                            d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span>  " + d.data.name
                            + "<br/> <span class='tooltip-text-bold'>Node Type:</span>  " + d.data.type
                            + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span>  " + totalEdgesInter
                            + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span>  " + incomingEdgesInter
                            + "<br/> <span class='tooltip-text-bold'># Outgoing Edges:</span>  " + outgoingEdgesInter)
                        }else if(selectedEdgeType.value === "Intra"){
                            d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span>  " + d.data.name
                            + "<br/> <span class='tooltip-text-bold'>Node Type:</span>  " + d.data.type
                            + "<br/> <span class='tooltip-text-bold'># Intra Edges:</span>  " + totalEdges
                            + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span>  " + incomingEdges
                            + "<br/> <span class='tooltip-text-bold'># Outgoing Edges:</span>  " + outgoingEdges)
                        }else{
                            d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span>  " + d.data.name
                            + "<br/> <span class='tooltip-text-bold'>Node Type:</span>  " + d.data.type
                            + "<br/> <span class='tooltip-text-bold'># Intra Edges:</span>  " + numberIntraEdges
                            + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span>  " + numberInterEdges)
                        }
        
                        // Set position of tooltip
                        d3.select('#root').select("#tooltipMiniIcicle").style("left", ( coords[0]) + "px")
                        .style("top", (coords[1]) + "px");
                        let toolTipHeight =  d3.select('#root').select("#tooltipMiniIcicle").select(".content").node().getBoundingClientRect().height;
                        d3.select('#root').select("#tooltipMiniIcicle").select(".content")
                        .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) - 5) + "px");
                        d3.select('#root').select("#tooltipMiniIcicle").style("height", firstPoint[1] + 'px')

                        if(selectedEdgeType.value === "Inter"){
                            // Highlight currently hovered over rectangle
                            svg.selectAll("rect").style("opacity", function(d2,i2){
                                if(d2.data.id === d.data.id){
                                    return 1;
                                }
                                return 0.3;
                            })
                            .attr("stroke", function(d2,i2){
                                for(let j = 0; j < filteredData.length; j++){
                                    if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d2.data.id ){
                                        return "black"
                                    } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d2.data.id  ){
                                        return "black"
                                    }
                                }

                
                                return "#c6c6c6";
                            })
                        }else{
                             // Highlight currently hovered over rectangle
                            svg.selectAll("rect").style("opacity", function(d2,i2){
                                if(d2.data.id === d.data.id){
                                    return 1;
                                }
                                return 0.3;
                            })
                            .attr("stroke", function(d2, i2){
                                if(d2.data.id === d.data.id){
                                    return "black";
                                }
                                return "#c6c6c6";
                            })
                        }//end else
        
                         // Highlight currently hovered over rectangle
                        svg.selectAll("circle").style("fill", function(d2,i2){
                            if(d2.data.id === d.data.id){
                                return "black";
                            }
                            return "gray";
                        })
                    })
                    .on("mouseout", function(event,d){
                        d3.select('#root').select("#tooltipMiniIcicle").style('display', 'none');
                        svg.selectAll("rect").style("opacity", 1).attr("stroke", "#c6c6c6");


                        if(selectedEdgeType.value === "Inter"){
                            svg.selectAll("rect").attr("stroke", function(d2,i2){
                
                                for(let j = 0; j < filteredData.length; j++){
                                    if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d2.data.id ){
                                        return "black"
                                    } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d2.data.id  ){
                                        return "black"
                                    }
                                }//end for loop

                
                                return "#c6c6c6";
                            })
                        }//end if
                        svg.selectAll("circle").style("fill", "black")
                    })
            }//end if
        }else if((prevProps.selectedEdgeNamesInterFilter !== this.props.selectedEdgeNamesInterFilter)
        || (prevProps.selectedNodeNamesInterFilter !== this.props.selectedNodeNamesInterFilter)
        || (prevProps.selectedNodeTypesInterFilter !== this.props.selectedNodeTypesInterFilter)
        || (prevProps.selectedDirectionInterFilter !== this.props.selectedDirectionInterFilter)){
            //Filter change
            console.log("Changing the real mini icicle due to filter change ", this.props, " and prev ", prevProps);
            const treesInterData = this.props.treesInterData;
            const filteredData = this.filterTreesInterData(treesInterData, this.props.selectedTreeName, this.props.selectedMiniIcicleTreeName);
            const selectedEdgeNamesInterFilter =this.props.selectedEdgeNamesInterFilter;
            const selectedNodeNamesInterFilter = this.props.selectedNodeNamesInterFilter;
            const selectedNodeTypesInterFilter = this.props.selectedNodeTypesInterFilter;
            const selectedDirectionInterFilter = this.props.selectedDirectionInterFilter;
            const selectedTree = this.props.selectedMiniIcicleTreeName;
            const selectedEdgeType = this.props.selectedEdgeType;
            const selectedTreeName = this.props.selectedTreeName;
            const divId = '#'+ this.props.id;

            //Filter the inter data
            let filteredInterDataFromDropdown = [];
            for(let i = 0; i < filteredData.length; i++){
                let filterRect = false;

                if(selectedEdgeNamesInterFilter.length !== 0 || selectedNodeNamesInterFilter.length !== 0 || selectedNodeTypesInterFilter.length !== 0 || selectedDirectionInterFilter !== null){
                    if(selectedEdgeNamesInterFilter.length === 0){
                        filterRect = true;
                    }else{
                        for(let j = 0; j < selectedEdgeNamesInterFilter.length; j++){
                            if(selectedEdgeNamesInterFilter[j].value === filteredData[i].edgeType){
                                filterRect=true;
                                break;
                            }
                        }
                    }

                    if(filterRect && selectedNodeNamesInterFilter.length === 0){
                        filterRect = true;
                    }else if(filterRect){
                        filterRect  = false;
                        for(let j = 0; j < selectedNodeNamesInterFilter.length; j++){
                            if(selectedTreeName === filteredData[i].startTree && 
                            selectedNodeNamesInterFilter[j].value === filteredData[i].startNode){
                                filterRect = true;
                                break;
                            }else if(selectedTreeName === filteredData[i].endTree &&
                            selectedNodeNamesInterFilter[j].value === filteredData[i].endNode){
                                filterRect = true;
                                break;
                            }
                        }
                    }
    
                    if(filterRect && selectedNodeTypesInterFilter.length === 0){
                        filterRect = true;
                    }else if(filterRect){
                        filterRect  = false;
                        for(let j = 0; j < selectedNodeTypesInterFilter.length; j++){
                            if(selectedTreeName === filteredData[i].startTree && 
                                selectedNodeTypesInterFilter[j].value === filteredData[i].startNodeType){
                                    filterRect = true;
                                break;
                            }else if(selectedTreeName === filteredData[i].endTree &&
                                selectedNodeTypesInterFilter[j].value === filteredData[i].endNodeType){
                                    filterRect = true;
                                break;
                            }
                        }
    
                    }
    
                    if(filterRect && selectedDirectionInterFilter === null){
                        filterRect = true;
                    }else if(filterRect && selectedDirectionInterFilter.value !== undefined && selectedNodeNamesInterFilter.length !== 0 ){
                        filterRect = false;
    
                        if(selectedDirectionInterFilter.value === "Either"){
                            filterRect = true;
                        }else if(selectedDirectionInterFilter.value === "Outgoing"){
                            for(let j = 0; j < selectedNodeNamesInterFilter.length; j++){
                                if((selectedNodeNamesInterFilter[j].value === filteredData[i].startNode)
                                && selectedTreeName === filteredData[i].startTree){
                                    filterRect=true;
                                    break;
                                }
                            }
                        }else{
                            for(let j = 0; j < selectedNodeNamesInterFilter.length; j++){
                                if((selectedNodeNamesInterFilter[j].value === filteredData[i].endNode) &&
                                selectedTreeName === filteredData[i].endTree){
                                    filterRect=true;
                                    break;
                                }
                            }
    
                        }
                    }
                }else{
                    filterRect = true;
                }

                if(filterRect){
                    filteredInterDataFromDropdown.push(filteredData[i])
                }
            }//end for loop

            let svg = d3.select(divId).select("#realMiniIcicleSVG").select("#treeMiniIcicleG");
            const selectedTreeIntraData = this.getSelectedTreeIntraData(this.props.treeIntraData, this.props.selectedMiniIcicleTreeName);
            let treeIntraDataFormatted = [];
            for(let i = 0; i < selectedTreeIntraData.length; i++){
                let obj1 = {};
                obj1.source = selectedTreeIntraData[i].startNodeID;
                obj1.target = selectedTreeIntraData[i].endNodeID;
                obj1.edgeType= selectedTreeIntraData[i].edgeType;
                treeIntraDataFormatted.push(obj1);
            }//end for loop
    
            // Get the number of edges per node for mini icicle tree
            let edgesPerNode = {};
            treeIntraDataFormatted.forEach(function(d2,i2){
                   
                if(edgesPerNode[d2.source] === undefined){
                    edgesPerNode[d2.source] = [];
                    edgesPerNode[d2.source].push(d2);
                }else{
                    edgesPerNode[d2.source].push(d2);
                } 
                
                if(edgesPerNode[d2.target] === undefined){
                    edgesPerNode[d2.target] = [];
                    edgesPerNode[d2.target].push(d2);
                }else{
                    edgesPerNode[d2.target].push(d2);
                } 
    
            })

            // Get the mini tree inter data
            let treeInterData = this.getSelectedTreeInterData(this.props.treesInterData, this.props.selectedMiniIcicleTreeName);
            // Get number of inter edges per node for mini icicle tree
            let edgesPerNodeInter = {};
            treeInterData.forEach(function(d,i){
    
                if(d.startTree === selectedTree && edgesPerNodeInter[d.startNodeID] === undefined){
                    edgesPerNodeInter[d.startNodeID] = [];
                    edgesPerNodeInter[d.startNodeID].push(d);
                }else if(d.startTree === selectedTree ){
                    edgesPerNodeInter[d.startNodeID].push(d);
                } 
                
                if(d.endTree === selectedTree && edgesPerNodeInter[d.endNodeID] === undefined){
                    edgesPerNodeInter[d.endNodeID] = [];
                    edgesPerNodeInter[d.endNodeID].push(d);
                }else if(d.endTree === selectedTree){
                    edgesPerNodeInter[d.endNodeID].push(d);
                } 
    
            })

            let getInterDataFunc = this.getSelectedTreeInterData;
            let getIntraDataFunc = this.getSelectedTreeIntraData;
            let treeIntraData = this.props.treeIntraData;
            let treeInterData2 = this.props.treesInterData;

            //Redraw the rect stroke and stroke-width
            svg.selectAll("rect")
            .attr("stroke", function(d,i){
                if(selectedEdgeType.value === "Inter"){
                    for(let j = 0; j < filteredInterDataFromDropdown.length; j++){
                        if(filteredInterDataFromDropdown[j].startTree === selectedTree && filteredInterDataFromDropdown[j].startNodeID === d.data.id ){
                            return "black"
                        } else if(filteredInterDataFromDropdown[j].endTree === selectedTree && filteredInterDataFromDropdown[j].endNodeID === d.data.id  ){
                            return "black"
                        }
                    }
                }

                    return "#c6c6c6";
            })
            .attr("stroke-width", function(d){
                if(selectedEdgeType.value === "Inter"){
                    for(let j = 0; j < filteredInterDataFromDropdown.length; j++){
                        if(filteredInterDataFromDropdown[j].startTree === selectedTree && filteredInterDataFromDropdown[j].startNodeID === d.data.id ){
                            return 3
                        } else if(filteredInterDataFromDropdown[j].endTree === selectedTree && filteredInterDataFromDropdown[j].endNodeID === d.data.id  ){
                            return 3
                        }
                    }
                }

                return 1;
            })
            .on("mouseover", function(event,d){
                console.log("component update mini icicle hovered filter voer ", d);
                d3.select('#root').select("#tooltipMiniIcicle").style('display', 'inline');
                
                let coords = d3.pointer( event,  d3.select('.colContainer').node());

                let edgesPerSelectedNode = edgesPerNode[d.data.id];
                //console.log("edgesPerselect ", edgesPerSelectedNode);
                
                let outgoingEdges = 0;
                let incomingEdges= 0;
                let totalEdges = 0;

                if(edgesPerSelectedNode !== undefined){
                    totalEdges = edgesPerSelectedNode.length
                    edgesPerSelectedNode.forEach(function(d2,i2){
                        if(d2.source === d.data.id){
                            outgoingEdges++;
                        }else{
                            incomingEdges++;
                        }
                    })
                }
                let edgesPerSelectedNodeInter= edgesPerNodeInter[d.data.id];

                let outgoingEdgesInter = 0;
                let incomingEdgesInter= 0;
                let totalEdgesInter = 0;

                if(edgesPerSelectedNodeInter !== undefined){
                    totalEdgesInter = edgesPerSelectedNodeInter.length
                    edgesPerSelectedNodeInter.forEach(function(d2,i2){
                        if(d2.startNodeID === d.data.id && d2.startTree === selectedTree){
                            outgoingEdgesInter++;
                        }else{
                            incomingEdgesInter++;
                        }
                    })
                }

                //get left col width
                let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                let midHeight = leftSideWidth.height / 2;
    
                let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                d3.select('#root').select("#tooltipMiniIcicle").select('.tail').select('path')
                    .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + firstPoint[1] + " L " + (firstPoint[0] + 10) + ", " + (firstPoint[1] - 10) + " Z");

                d3.select('#root').select("#tooltipMiniIcicle").select(".content")
                .style('margin-left', firstPoint[0] +'px');

                //Get Inter data
                const currentTreeInterData = getInterDataFunc(treeInterData2, selectedTree);
                let numberInterEdges = 0;
                currentTreeInterData.forEach(function(d2, i2){
                    //TO CHANGE TO ID
                    if(d2.startTree === selectedTree){
                        if(d2.startNodeID === d.data.id){
                            numberInterEdges++;
                        }
                    }else if(d2.endTree === selectedTree){
                        if(d2.endNodeID === d.data.id){
                            numberInterEdges++;
                        }
                    }
                })

                //Get INtra Data
                const currentTreeIntraData = getIntraDataFunc(treeIntraData, selectedTree);
                let numberIntraEdges = 0;
                currentTreeIntraData.forEach(function(d2, i2){
                    //TO CHANGE TO ID
                    if(d2.startNodeID === d.data.id || d2.endNodeID === d.data.id){
                        numberIntraEdges++;
                    }
                })

                if(selectedEdgeType.value === "Inter"){
                    d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span>  " + d.data.name
                    + "<br/> <span class='tooltip-text-bold'>Node Type: </span> " + d.data.type
                    + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span>  " + totalEdgesInter
                    + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span>  " + incomingEdgesInter
                    + "<br/> <span class='tooltip-text-bold'># Outgoing Edges:</span>  " + outgoingEdgesInter)
                }else if(selectedEdgeType.value === "Intra"){
                    d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span>  " + d.data.name
                    + "<br/> <span class='tooltip-text-bold'>Node Type:</span>  " + d.data.type
                    + "<br/> <span class='tooltip-text-bold'># Intra Edges: </span> " + totalEdges
                    + "<br/> <span class='tooltip-text-bold'># Incoming Edges: </span> " + incomingEdges
                    + "<br/> <span class='tooltip-text-bold'># Outgoing Edges: </span> " + outgoingEdges)
                }else{
                    //console.log("hi there -------------------------------------------------")
                    d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span>  " + d.data.name
                    + "<br/> <span class='tooltip-text-bold'>Node Type:</span>  " + d.data.type
                    + "<br/> <span class='tooltip-text-bold'># Intra Edges:</span>  " + numberIntraEdges
                    + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span>  " + numberInterEdges)
                }

                

                d3.select('#root').select("#tooltipMiniIcicle").style("left", ( coords[0]) + "px")
                .style("top", (coords[1]) + "px");
                
                let toolTipHeight =  d3.select('#root').select("#tooltipMiniIcicle").select(".content").node().getBoundingClientRect().height;
                d3.select('#root').select("#tooltipMiniIcicle").select(".content")
                .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) - 5) + "px");

                d3.select('#root').select("#tooltipMiniIcicle").style("height", firstPoint[1] + 'px')

                if(selectedEdgeType.value === "Inter"){

                    svg.selectAll("rect").style("opacity", function(d2,i2){
                        //TODO: might change to id as there maybe be multiple same names
                        if(d2.data.id === d.data.id){
                            return 1;
                        }
                        return 0.3;
                    })
                    .attr("stroke", function(d2,i2){

                        //console.log("d2 ", d2.data);
        
                        for(let j = 0; j < filteredInterDataFromDropdown.length; j++){
                            if(filteredInterDataFromDropdown[j].startTree === selectedTree && filteredInterDataFromDropdown[j].startNodeID === d2.data.id ){
                                //console.log("here 111 ");
                                    return "black"
                            } else if(filteredInterDataFromDropdown[j].endTree === selectedTree && filteredInterDataFromDropdown[j].endNodeID === d2.data.id  ){
                                //console.log("here 1221 ");
                                return "black"
                            }
                        }

        
                        return "#c6c6c6";
                    })
                }else{
                    svg.selectAll("rect").style("opacity", function(d2,i2){
                        //TODO: might change to id as there maybe be multiple same names
                        if(d2.data.id === d.data.id){
                            return 1;
                        }
                        return 0.3;
                    })
                    .attr("stroke", function(d2, i2){
                        if(d2.data.id === d.data.id){
                            return "black";
                        }
                        return "#c6c6c6";
                    })
                }




                svg.selectAll("circle").style("fill", function(d2,i2){
                    //TODO: might change to id as there maybe be multiple same names
                    if(d2.data.id === d.data.id){
                        return "black";
                    }
                    return "gray";
                })
            })
            .on("mouseout", function(event,d){
                console.log("goodbye", d.data);
                d3.select('#root').select("#tooltipMiniIcicle").style('display', 'none');
                svg.selectAll("rect").style("opacity", 1).attr("stroke", "#c6c6c6");


                if(selectedEdgeType.value === "Inter"){
                    svg.selectAll("rect").attr("stroke", function(d2,i2){
        
                        for(let j = 0; j < filteredInterDataFromDropdown.length; j++){
                            if(filteredInterDataFromDropdown[j].startTree === selectedTree && filteredInterDataFromDropdown[j].startNodeID === d2.data.id ){
                                return "black"
                            } else if(filteredInterDataFromDropdown[j].endTree === selectedTree && filteredInterDataFromDropdown[j].endNodeID === d2.data.id  ){
                                return "black"
                            }
                        }

        
                        return "#c6c6c6";
                    })
                }
                svg.selectAll("circle").style("fill", "black")

            })
        }//end else if
    }//end component did update

    componentWillUnmount(){
        window.removeEventListener("resize", this.redrawChart, false);
        d3.select('#root').select("#tooltipMiniIcicle").remove();
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
        console.log("redrawing realmini icicle diagram");

        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();
        d3.select('#root').select("#tooltipMiniIcicle").select("svg").remove();
        d3.select('#root').select("#tooltipMiniIcicle").select("div").remove();

        //Redraw the direct chord diagram
        this.drawRealMiniIcicleDiagram = this.drawRealMiniIcicleDiagram.bind(this);
        this.drawRealMiniIcicleDiagram();
    }//end redrawChart function

    // Gets the tree hierarchy data given a name
    getSelectedTreeData(name, data){
        for(let i = 0; i < data.length; i++){
            if(data[i].name === name){
                return data[i];
            } //end if
        }//end for loop
        return -1;
    }// end getSelectedTreeData function

    // Get for the mini icicle tree the inter edges connected to the main icicle tree
    filterTreesInterData(treesInterData, mainAreaTreeName, miniTreeName){
        let index = -1;
        for(let i = 0; i < treesInterData.length; i++){
            if(treesInterData[i][0].jsonTree === mainAreaTreeName){
                index = i;
                break;
            }
        }

        let res = [];
        for(let i = 0; i < treesInterData[index].length; i++){
            if(treesInterData[index][i].startTree === miniTreeName){
                res.push(treesInterData[index][i])
            }else if(treesInterData[index][i].endTree === miniTreeName){
                res.push(treesInterData[index][i])
            }
        }

        return res;
    } //end filterTreesInterData function

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
    } //end getSelectedTreeInterData function

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
    }//end getSelectedTreeIntraData function


    // Draws the mini icicle diagram
    drawRealMiniIcicleDiagram(){
        console.log("In drawRealMiniIcicleDiagram ", this.props);

        const divId = '#'+ this.props.id;
        let height = this.state.height ;
        let width = this.state.width;
        const selectedTree =  this.props.selectedMiniIcicleTreeName;
        const selectedEdgeType = this.props.selectedEdgeType;
        const divSmall = 1.0;
        let originalWidth = this.state.width / divSmall;
        let originalHeight = this.state.height /divSmall;

        d3.select('#root').select("#tooltipMiniIcicle")
        .style('position', 'absolute').style('display', 'none');

        function zoomed({transform}) {
            svg.attr("transform", transform);
        }
        let zoomTotal = d3.zoom()
            .scaleExtent([1/4, 100])
            .on("zoom", zoomed);

        let svg = d3.select(divId).attr("class", "miniSVG").append('svg').attr("id", "realMiniIcicleSVG")
            .attr("width", width).attr("height", height)
            .style("border", "solid").style("border-color", "black")
            .call(zoomTotal).append('g').attr("id", "treeMiniIcicleG");

        //Get tree data
        const currentTreeData = this.getSelectedTreeData(selectedTree, this.props.treeData)
        if(currentTreeData === -1){
            console.log("Error no tree in the data with ", selectedTree)
            return;
        }
        
        let partition = d3.partition().size([width, height]).padding(2);
        let rootNode = d3.hierarchy(currentTreeData);
        rootNode.count()
        partition(rootNode);

        //Get min width and height to draw the icicle tree
        let radius = 5;
        let fixers = [];
        let fixersY = [];
        (rootNode.descendants()).forEach(function(d){
            if(d.x1 - d.x0 < radius * 2.5){
                fixers.push(d);
            }
            if(d.y1 - d.y0 < radius *2.5){
                fixersY.push(d);
            }
        })

        while(fixers.length > 0 || fixersY.length > 0){
            if(fixers.length > 0){
                width = width + 1;
                svg.attr("width", width)
            }

            if(fixersY.length > 0){
                height = height + 1;
                svg.attr("height", height)
            }
            partition = d3.partition().size([width, height]).padding(2)
            partition(rootNode);
    
            fixers = [];
            fixersY = [];
    
            (rootNode.descendants()).forEach(function(d){
                if(d.x1 - d.x0 < radius * 2.5){
                    fixers.push(d);
                }
                if(d.y1 - d.y0 < radius *2.5){
                    fixersY.push(d);
                }
            })
        }//end while

        // Set color scheme
        const nodeTypes = this.props.uniqueNodeTypesAllTrees;
        const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#ffffb3'];
        const color = d3.scaleOrdinal( )
        .domain(nodeTypes)
        .range(colorSet);
        
        // Define the tooltip content and tail
        d3.select('#root').select("#tooltipMiniIcicle").append("svg").attr("class", "tail")
            .style('position', 'absolute')
            .style('top', '0')
            .style('left', '0')
            .attr("width", "100%")
            .attr("height", "100%")
            .append("path")
            .attr("d",`M 0, 0 L 30, 40 L 40, 30 Z`)
            .attr("fill", "lightgray")
            .style("stroke", "black");

        d3.select('#root').select("#tooltipMiniIcicle").append("div")
            .attr("class", "content")
            .style('position', 'relative')
            .style("text-align", "center")
            .style('top', '0')
            .style('left', '0')
            .style('padding', '2px')
            .style('border', '1px solid black')
            .style('border-radius', '8px')
            .style('pointer-events', 'none')
            .style('background', 'lightgray');


        //Filter the edges from interedges tree data in the main area
        const treesInterData = this.props.treesInterData;
        const filteredData = this.filterTreesInterData(treesInterData, this.props.selectedTreeName, this.props.selectedMiniIcicleTreeName);

        // Get intra data
        const selectedTreeIntraData = this.getSelectedTreeIntraData(this.props.treeIntraData, this.props.selectedMiniIcicleTreeName);
        let treeIntraDataFormatted = [];
        for(let i = 0; i < selectedTreeIntraData.length; i++){
            let obj1 = {};
            obj1.source = selectedTreeIntraData[i].startNodeID;
            obj1.target = selectedTreeIntraData[i].endNodeID;
            obj1.edgeType= selectedTreeIntraData[i].edgeType;
            treeIntraDataFormatted.push(obj1);
        }
        //Get number of intra edges per node
        let edgesPerNode = {};
        treeIntraDataFormatted.forEach(function(d2,i2){
               
            if(edgesPerNode[d2.source] === undefined){
                edgesPerNode[d2.source] = [];
                edgesPerNode[d2.source].push(d2);
            }else{
                edgesPerNode[d2.source].push(d2);
            } 
            
            if(edgesPerNode[d2.target] === undefined){
                edgesPerNode[d2.target] = [];
                edgesPerNode[d2.target].push(d2);
            }else{
                edgesPerNode[d2.target].push(d2);
            } 

        })

        //Get inter data and number of inter edges per node
        let treeInterData = this.getSelectedTreeInterData(this.props.treesInterData, this.props.selectedMiniIcicleTreeName);
        let edgesPerNodeInter = {};
        treeInterData.forEach(function(d,i){

            if(d.startTree === selectedTree && edgesPerNodeInter[d.startNodeID] === undefined){
                edgesPerNodeInter[d.startNodeID] = [];
                edgesPerNodeInter[d.startNodeID].push(d);
            }else if(d.startTree === selectedTree ){
                edgesPerNodeInter[d.startNodeID].push(d);
            } 
            
            if(d.endTree === selectedTree && edgesPerNodeInter[d.endNodeID] === undefined){
                edgesPerNodeInter[d.endNodeID] = [];
                edgesPerNodeInter[d.endNodeID].push(d);
            }else if(d.endTree === selectedTree){
                edgesPerNodeInter[d.endNodeID].push(d);
            } 

        })

        let getInterDataFunc = this.getSelectedTreeInterData;
        let getIntraDataFunc = this.getSelectedTreeIntraData;
        let treeIntraData = this.props.treeIntraData;
        let treeInterData2 = this.props.treesInterData;

        //Icicle Part
        svg.append('g')
            .selectAll('rect')
            .data(rootNode.descendants())
            .enter()
            .append('rect')
            .attr('x', function(d) { return d.x0; })
            .attr('y', function(d) { return d.y0; })
            .attr('width', function(d) { return d.x1 - d.x0; })
            .attr('height', function(d) { return d.y1 - d.y0; })
            .attr("fill", function(d){
                return color(d.data.type)
            })
            .attr("stroke", function(d,i){
                // Highlight the nodes that are inter edges with main icicle
                if(selectedEdgeType.value === "Inter"){
                    for(let j = 0; j < filteredData.length; j++){
                        if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d.data.id ){
                            return "black"
                        } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d.data.id  ){
                            return "black"
                        }
                    }
                }

                return "#c6c6c6";
            })
            .attr("stroke-width", function(d){
                // Highlight the nodes that are inter edges with main icicle
                if(selectedEdgeType.value === "Inter"){
                    for(let j = 0; j < filteredData.length; j++){
                        if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d.data.id ){
                            return 3
                        } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d.data.id  ){
                            return 3
                        }
                    }
                }

                return 1;
            })
            .on("mouseover", function(event,d){
                console.log("real mini icicle hovered voer ", d.data);
                d3.select('#root').select("#tooltipMiniIcicle").style('display', 'inline');
                
                let coords = d3.pointer( event,  d3.select('.colContainer').node());

                // Get number of edges for intra view
                let edgesPerSelectedNode = edgesPerNode[d.data.id];
                let outgoingEdges = 0;
                let incomingEdges= 0;
                let totalEdges = 0;
                if(edgesPerSelectedNode !== undefined){
                    totalEdges = edgesPerSelectedNode.length
                    edgesPerSelectedNode.forEach(function(d2,i2){
                        if(d2.source === d.data.id){
                            outgoingEdges++;
                        }else{
                            incomingEdges++;
                        }
                    })
                }

                //Get number edges for inter view
                let edgesPerSelectedNodeInter= edgesPerNodeInter[d.data.id];
                let outgoingEdgesInter = 0;
                let incomingEdgesInter= 0;
                let totalEdgesInter = 0;
                if(edgesPerSelectedNodeInter !== undefined){
                    totalEdgesInter = edgesPerSelectedNodeInter.length
                    edgesPerSelectedNodeInter.forEach(function(d2,i2){
                        if(d2.startNodeID === d.data.id && d2.startTree === selectedTree){
                            outgoingEdgesInter++;
                        }else{
                            incomingEdgesInter++;
                        }
                    })
                }

                //get left col width
                let leftSideWidth = d3.select('.colContainer').node().getBoundingClientRect();
                let midHeight = leftSideWidth.height / 2;
                let firstPoint = [leftSideWidth.width - coords[0], midHeight - coords[1]];

                // Draw tail and content of tooltip
                d3.select('#root').select("#tooltipMiniIcicle").select('.tail').select('path')
                    .attr("d", "M 0, 0 L " + firstPoint[0] + ", " + firstPoint[1] + " L " + (firstPoint[0] + 10) + ", " + (firstPoint[1] - 10) + " Z");
                d3.select('#root').select("#tooltipMiniIcicle").select(".content")
                .style('margin-left', (firstPoint[0]) +'px');

                //Get Inter data and number of inter edges per node
                const currentTreeInterData = getInterDataFunc(treeInterData2, selectedTree);
                let numberInterEdges = 0;
                currentTreeInterData.forEach(function(d2, i2){
                    //TO CHANGE TO ID
                    if(d2.startTree === selectedTree){
                        if(d2.startNodeID === d.data.id){
                            numberInterEdges++;
                        }
                    }else if(d2.endTree === selectedTree){
                        if(d2.endNodeID === d.data.id){
                            numberInterEdges++;
                        }
                    }
                })

                //Get INtra Data
                const currentTreeIntraData = getIntraDataFunc(treeIntraData, selectedTree);
                let numberIntraEdges = 0;
                currentTreeIntraData.forEach(function(d2, i2){
                    if(d2.startNodeID === d.data.id || d2.endNodeID === d.data.id){
                        numberIntraEdges++;
                    }
                })

                if(selectedEdgeType.value === "Inter"){
                    console.log("inter for hvoer")
                    d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span> " + d.data.name
                    + "<br/> <span class='tooltip-text-bold'>Node Type:</span> " + d.data.type
                    + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span>" + totalEdgesInter
                    + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span> " + incomingEdgesInter
                    + "<br/> <span class='tooltip-text-bold'># Outgoing Edges: </span>" + outgoingEdgesInter)
                }else if(selectedEdgeType.value === "Intra"){
                    console.log("intra for hvoer")
                    d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name: </span>" + d.data.name
                    + "<br/> <span class='tooltip-text-bold'>Node Type:</span> " + d.data.type
                    + "<br/> <span class='tooltip-text-bold'># Intra Edges:</span> " + totalEdges
                    + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span> " + incomingEdges
                    + "<br/> <span class='tooltip-text-bold'># Outgoing Edges:</span> " + outgoingEdges)
                }else{
                    console.log("hier for hvoer")
                    d3.select('#root').select("#tooltipMiniIcicle").select(".content").html("<span class='tooltip-text-bold'>Node Name:</span> " + d.data.name
                    + "<br/> <span class='tooltip-text-bold'>Node Type:</span> " + d.data.type
                    + "<br/> <span class='tooltip-text-bold'># Intra Edges:</span> " +  numberIntraEdges
                    + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span>" + numberInterEdges)
                }

                

                d3.select('#root').select("#tooltipMiniIcicle").style("left", ( coords[0]) + "px")
                .style("top", (coords[1]) + "px");
                let toolTipHeight =  d3.select('#root').select("#tooltipMiniIcicle").select(".content").node().getBoundingClientRect().height;
                d3.select('#root').select("#tooltipMiniIcicle").select(".content")
                .style("top", (-coords[1] + (midHeight) - (toolTipHeight/2) - 5) + "px");
                d3.select('#root').select("#tooltipMiniIcicle").style("height", firstPoint[1] + 'px')

                if(selectedEdgeType.value === "Inter"){
                    //Highlight hovered over rect
                    svg.selectAll("rect").style("opacity", function(d2,i2){
                        if(d2.data.id === d.data.id){
                            return 1;
                        }
                        return 0.3;
                    })
                    .attr("stroke", function(d2,i2){
                        for(let j = 0; j < filteredData.length; j++){
                            if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d2.data.id ){
                                    return "black"
                            } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d2.data.id  ){
                                return "black"
                            }
                        }

                        return "#c6c6c6";
                    })
                }else{
                     //Highlight hovered over rect
                    svg.selectAll("rect").style("opacity", function(d2,i2){
                        if(d2.data.id === d.data.id){
                            return 1;
                        }
                        return 0.3;
                    })
                    .attr("stroke", function(d2, i2){
                        if(d2.data.id === d.data.id){
                            return "black";
                        }
                        return "#c6c6c6";
                    })
                }

                svg.selectAll("circle").style("fill", function(d2,i2){
                    if(d2.data.id === d.data.id){
                        return "black";
                    }
                    return "gray";
                })
            })
            .on("mouseout", function(event,d){
                console.log("hovered left ", d.data);
                d3.select('#root').select("#tooltipMiniIcicle").style('display', 'none');
                svg.selectAll("rect").style("opacity", 1).attr("stroke", "#c6c6c6");

                if(selectedEdgeType.value === "Inter"){
                    svg.selectAll("rect").attr("stroke", function(d2,i2){
        
                        for(let j = 0; j < filteredData.length; j++){
                            if(filteredData[j].startTree === selectedTree && filteredData[j].startNodeID === d2.data.id ){
                                return "black"
                            } else if(filteredData[j].endTree === selectedTree && filteredData[j].endNodeID === d2.data.id  ){
                                return "black"
                            }
                        }
        
                        return "#c6c6c6";
                    })
                }
                svg.selectAll("circle").style("fill", "black")
            })

        //Draw the circle
        svg.append('g').selectAll("circle")
            .data(rootNode.descendants())
            .enter().append("circle")
            .attr("r", radius)
            .attr("cx", function(d) { 
                return  (d.x0 + d.x1 )/ 2; 
            } )
            .attr("cy",  function(d) { 
                return  ( d.y1 + d.y0 )/ 2; 
            })
            .style("fill", "black")


        let bounds2 = svg.node().getBBox();
        let fullWidth = originalWidth,
            fullHeight =  originalHeight;
        let width2 = bounds2.width,
            height2 = bounds2.height;

        let midX = bounds2.x + width2 / 2,
        midY = bounds2.y + height2 / 2;

        let paddingPercent = 0.95;
        let transitionDuration = 500;

        let scale1 = (paddingPercent) / Math.max(width2 / fullWidth, height2 / fullHeight);
        let translate1 = [fullWidth / 2 - scale1 * midX, fullHeight / 2 - scale1 * midY];

        //Update min scale
        zoomTotal.scaleExtent([scale1, 100]);

        svg.transition()
            .duration(transitionDuration)
            .call(zoomTotal.transform,
            d3.zoomIdentity.translate(translate1[0], translate1[1]).scale(scale1));

        //Fix inital zooming problem when try to zoom
        d3.select(divId).select("#realMiniIcicleSVG").call(zoomTotal.transform,
            d3.zoomIdentity.translate(translate1[0], translate1[1]).scale(scale1));

        //svg.selectAll("circle").raise();
        d3.select("#tooltipMiniIcicle").raise();
    }//end drawRealMiniChordDiagram function

    render(){
        console.log("Rendering for RealMiniIcicleDiagram")
      
        return <div id={this.props.id} ref={this.chartRef} ></div>
    }//end render
}//end class

export default RealMiniIcicleDiagram;