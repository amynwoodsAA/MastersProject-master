import React from 'react';
import * as d3 from "d3";

class TreeIcicleIntra extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of TreeIcicleIntra");
        this.state = {selectedEdgeNamesFilter: []};
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In componenet did mount for TreeIcicleIntra");

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawTreeIcicleIntra();
        })

        d3.select('.mainArea').append('div')
        .attr("class", "myTooltip")
        .attr("id", "tooltip3")

        window.addEventListener("resize", this.redrawChart);
    }//end componenrDidMount function

    componentDidUpdate(prevProps, prevState){
        console.log("In componenet did update for TreeIcicleIntra");
        if((prevProps.selectedEdgeNamesIntraFilter !== this.props.selectedEdgeNamesIntraFilter)
            || (prevProps.selectedNodeNamesIntraFilter !== this.props.selectedNodeNamesIntraFilter)
            || (prevProps.selectedDirectionIntraFilter !== this.props.selectedDirectionIntraFilter)
            || (prevProps.selectedNodeTypesIntraFilter !== this.props.selectedNodeTypesIntraFilter)){
            console.log("props filter changed for intra", this.props);
            const selectedEdgeNamesIntraFilter =this.props.selectedEdgeNamesIntraFilter;
            const selectedNodeNamesIntraFilter =this.props.selectedNodeNamesIntraFilter;
            const selectedNodeTypesIntraFilter = this.props.selectedNodeTypesIntraFilter;
            const selectedDirectionIntraFilter = this.props.selectedDirectionIntraFilter;

            const divId = '#'+ this.props.id;
            const selectedTreeName = this.props.selectedTreeName;
            const currentTreeData = this.getSelectedTreeData(selectedTreeName, this.props.treeData);
            let height = this.state.height ;
            const divSmall = 1.5;
            let width = this.state.width / divSmall;
            let originalWidth = this.state.width / divSmall;
            let originalHeight = this.state.height /divSmall;
            let markerWidth = 8;
            var transformXSvg = this.state.width/2 - (originalWidth/2);
            var transformYSVG = this.state.height/2 - (originalHeight/2);
    
            if(currentTreeData === -1){
                console.log("Error no tree in the data with ", selectedTreeName);
                return;
            }

            let partition = d3.partition().size([width, height/divSmall]).padding(2);
            let rootNode = d3.hierarchy(currentTreeData);
            rootNode.count()
            partition(rootNode);

            let radius = 8;
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
            while(fixers.length > 0|| fixersY.length > 0){
                if(fixers.length > 0){
                    width = width + 1;
                }
    
                if(fixersY.length > 0){
                    height = height + 1;
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
            }//end while loop

            //Filter the intra data
            let treeIntraDataFormatted = [];
            const selectedTreeIntraData = this.getSelectedTreeIntraData(this.props.treeIntraData, this.props.selectedTreeName);
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
                    let obj1 = {};
                    obj1.source = selectedTreeIntraData[i].startNodeID;
                    obj1.target = selectedTreeIntraData[i].endNodeID;
                    obj1.edgeType= selectedTreeIntraData[i].edgeType;
                    obj1.sourceName = selectedTreeIntraData[i].startNode;
                    obj1.targetName = selectedTreeIntraData[i].endNode;
                    treeIntraDataFormatted.push(obj1);
                }
            }//end for loop

            let pathPoints = [];
            d3.select(divId).select("#treeIcicleSVG").select("#pathEdges").selectAll("path.link")
            .data(treeIntraDataFormatted)
            .join('path')
            .attr("class", "link")
            .attr("d", function(d){
                let sourceData = null;
                let targetData = null;
                let currentPathObj = {};

                for(let index = 0; index < rootNode.descendants().length; index++ ){
                    if(sourceData == null || targetData == null){
                        if(rootNode.descendants()[index].data.id === d.source){
                            sourceData = rootNode.descendants()[index]
                        }else if(rootNode.descendants()[index].data.id === d.target){
                            targetData = rootNode.descendants()[index];
                        }
                    }else{
                        break;
                    }
                }

                let x = (sourceData.x0 + sourceData.x1 )/ 2;
                let y = ( sourceData.y1 + sourceData.y0 )/ 2;
                let parentX = (targetData.x0 + targetData.x1 )/ 2;
                let parentY = (targetData.y0 + targetData.y1 )/ 2;

                let markerAddSubtract = "add";
                if(y === parentY && x < parentX){
                    parentX = parentX- (markerWidth*2);
                    markerAddSubtract = "subtract";
                }else if(y === parentY && x > parentX){
                    parentX = parentX + (markerWidth*2);
                }else if(x === parentX && y < parentY){
                    parentY = parentY - (markerWidth*2);
                    markerAddSubtract = "subtract";
                }else if(x === parentX &&  y> parentY){
                    parentY = parentY + (markerWidth*2);
                }else if(x < parentX && y < parentY){
                    parentY = parentY - (markerWidth*2);
                    markerAddSubtract = "subtract";
                }else if(x < parentX && y > parentY){
                    parentY = parentY + (markerWidth*2)
                }else if(x > parentX && y > parentY){
                    parentY = parentY + (markerWidth*2)
                }else if(x > parentX && y < parentY){
                    parentY = parentY - (markerWidth*2);
                    markerAddSubtract = "subtract";
                }

                let cp1 = [x, (y+parentY)/2];
                let cp2 = [parentX , (y+parentY)/2];

                if(pathPoints.length === 0){
                    currentPathObj.startNode = d.source;
                    currentPathObj.endNode = d.target;
                    currentPathObj.points = [];
                    let temp = {};
                    temp.startPoint = [x, y];
                    temp.control1 = [x, (y+parentY)/2];
                    temp.control2 = [parentX, (y+parentY)/2];
                    temp.endPoint = [parentX, parentY];
                    temp.subAdd = markerAddSubtract;
                    temp.belowAbove = "middle";
                    currentPathObj.points.push(temp);
                    pathPoints.push(currentPathObj);
                }else{
                    //Check if horz, vert or diag
                    let horz = false;
                    let vert = false;

                    if(y === parentY){
                        horz = true;
                    }else if(x === parentX ){
                        vert = true;
                    }

                    if(horz){
                        //Check if same points or opposite
                        let foundPathPoints = -1;

                        for(let j = 0; j < pathPoints.length; j++){
                            if((pathPoints[j].startNode === d.source && pathPoints[j].endNode === d.target)
                            || (pathPoints[j].startNode === d.target && pathPoints[j].endNode === d.source)){
                                foundPathPoints = j;
                                break;
                            }
                        }

                        if(foundPathPoints !== -1){
                            // found a path points match

                            if(pathPoints[foundPathPoints].startNode === d.target && pathPoints[foundPathPoints].endNode === d.source ){
                                //go below
                                let mult = 1;
                                if(pathPoints[foundPathPoints].points.length !== 1){
                                    pathPoints[foundPathPoints].points.forEach(function(d2, i2){
                                        if(d2.belowAbove === "below"){
                                            mult++;
                                        }
                                    })
                                }
                                cp1[1] += (20 * mult);
                                cp2[1] += (20 * mult);

                                let mult2 = ((mult-1) * 0.2)
                                let mult3 = ((mult-1) * 0.15)

                                if(markerAddSubtract === "add"){
                                    parentX = parentX - (markerWidth*(1+ mult2));
                                }else{
                                    parentX = parentX + (markerWidth*(1+ mult2));
                                }
                                parentY = parentY + (markerWidth*(1.5+ mult3));

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "below";
                                pathPoints[foundPathPoints].points.push(temp);
                            }else{
                                //go above
                                let mult = 1;
                                if(pathPoints[foundPathPoints].points.length !== 1){
                                    pathPoints[foundPathPoints].points.forEach(function(d2, i2){
                                        if(d2.belowAbove === "above"){
                                            mult++;
                                        }
                                    })
                                }
                                cp1[1] -= (20 * mult);
                                cp2[1] -= (20 * mult);

                                let mult2 = ((mult-1) * 0.2)
                                let mult3 = ((mult-1) * 0.15)

                                if(markerAddSubtract === "add"){
                                    parentX = parentX - (markerWidth*(1+ mult2));
                                }else{
                                    parentX = parentX + (markerWidth*(1+ mult2));
                                }
                                parentY = parentY - (markerWidth*(1.5 + mult3));

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "above";
                                pathPoints[foundPathPoints].points.push(temp);
                            }//end else
                        }else{
                            // found NO path points match
                            currentPathObj.startNode = d.source;
                            currentPathObj.endNode = d.target;
                            currentPathObj.points = [];
                            let temp = {};
                            temp.startPoint = [x, y];
                            temp.control1 = [x, (y+parentY)/2];
                            temp.control2 = [parentX, (y+parentY)/2];
                            temp.endPoint = [parentX, parentY];
                            temp.subAdd = markerAddSubtract;
                            temp.belowAbove = "middle"
                            currentPathObj.points.push(temp);
                            pathPoints.push(currentPathObj);
                        }

                    }else if(vert){
                        let foundPathPoints = -1;
                        for(let j = 0; j < pathPoints.length; j++){
                            if((pathPoints[j].startNode === d.source && pathPoints[j].endNode === d.target)
                            || (pathPoints[j].startNode === d.target && pathPoints[j].endNode === d.source)){
                                foundPathPoints = j;
                                break;
                            }
                        }

                        if(foundPathPoints !== -1){
                            if(pathPoints[foundPathPoints].startNode === d.target && pathPoints[foundPathPoints].endNode === d.source ){
                                //Go right
                                let mult = 1;
                                if(pathPoints[foundPathPoints].points.length !== 1){
                                    pathPoints[foundPathPoints].points.forEach(function(d2, i2){
                                        if(d2.belowAbove === "below"){
                                            mult++;
                                        }
                                    })
                                }

                                cp1[0] += (20 * mult);
                                cp2[0] += (20 * mult);

                                let mult2 = ((mult-1) * 0.2)
                                let mult3 = ((mult-1) * 0.15)

                                if(markerAddSubtract === "add"){
                                    parentY = parentY - (markerWidth*(1+mult2));
                                }else{
                                    parentY = parentY + (markerWidth*(1+mult2));
                                }
                                parentX = parentX + (markerWidth*(1.5+ mult3));

                                
                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "below";
                                pathPoints[foundPathPoints].points.push(temp);
                            }else{
                                //Go left
                                let mult = 1;
                                if(pathPoints[foundPathPoints].points.length !== 1){
                                    pathPoints[foundPathPoints].points.forEach(function(d2, i2){
                                        if(d2.belowAbove === "above"){
                                            mult++;
                                        }
                                    })
                                }
                                cp1[0] -= (20 * mult);
                                cp2[0] -= (20 * mult);

                                let mult2 = ((mult-1) * 0.2)
                                let mult3 = ((mult-1) * 0.15)

                                if(markerAddSubtract === "add"){
                                    parentY = parentY - (markerWidth*(1+mult2));
                                }else{
                                    parentY = parentY + (markerWidth*(1+mult2));
                                }
                                parentX = parentX - (markerWidth*(1.5+ mult3));

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "above";
                                pathPoints[foundPathPoints].points.push(temp);
                            }//end else
                        }else{
                            currentPathObj.startNode = d.source;
                            currentPathObj.endNode = d.target;
                            currentPathObj.points = [];
                            let temp = {};
                            temp.startPoint = [x, y];
                            temp.control1 = [x, (y+parentY)/2];
                            temp.control2 = [parentX, (y+parentY)/2];
                            temp.endPoint = [parentX, parentY];
                            temp.subAdd = markerAddSubtract;
                            temp.belowAbove = "middle"
                            currentPathObj.points.push(temp);
                            pathPoints.push(currentPathObj);
                        }//end else


                    }else{
                        let foundPathPoints = -1;

                        for(let j = 0; j < pathPoints.length; j++){
                            if((pathPoints[j].startNode === d.source && pathPoints[j].endNode === d.target)){
                                foundPathPoints = j;
                                break;
                            }
                        }

                        if(foundPathPoints !== -1){
                            let caseNumber = -1;
                            if(x < parentX && y < parentY){
                                caseNumber = 0;
                            }else if(x < parentX && y > parentY){
                                caseNumber = 1;
                            }else if(x > parentX && y > parentY){
                                caseNumber = 2;
                            }else if(x > parentX && y < parentY){
                                caseNumber = 3;
                            }

                            if(caseNumber === 0){
                                // console.log("IN CASE 0 NUMBER");
                                let mult = pathPoints[foundPathPoints].points.length;

                                cp1[1] -= (20 * mult);
                                cp2[1] -= (20 * mult);

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                pathPoints[foundPathPoints].points.push(temp);
                            }else if(caseNumber === 1){
                                // console.log("IN CASE 1 NUMBER");
                                let mult = pathPoints[foundPathPoints].points.length;

                                cp1[1] += (20 * mult);
                                cp2[1 ]+= (20 * mult);

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                pathPoints[foundPathPoints].points.push(temp);

                            }else if(caseNumber === 2){
                                // console.log("IN CASE 2 NUMBER");
                                let mult = pathPoints[foundPathPoints].points.length;
                                cp1[1] += (20 * mult);
                                cp2[1] += (20 * mult);

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                pathPoints[foundPathPoints].points.push(temp);

                            }else if(caseNumber === 3){
                                // console.log("IN CASE 3 NUMBER");
                                let mult = pathPoints[foundPathPoints].points.length;
                                cp1[1] -= (20 * mult);
                                cp2[1] -= (20 * mult);

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                pathPoints[foundPathPoints].points.push(temp);
                            }
                        }else{
                            currentPathObj.startNode = d.source;
                            currentPathObj.endNode = d.target;
                            currentPathObj.points = [];
                            let temp = {};
                            temp.startPoint = [x, y];
                            temp.control1 = [x, (y+parentY)/2];
                            temp.control2 = [parentX, (y+parentY)/2];
                            temp.endPoint = [parentX, parentY];
                            temp.subAdd = markerAddSubtract;
                            temp.belowAbove = "middle"
                            currentPathObj.points.push(temp);
                            pathPoints.push(currentPathObj);
                        }
                    }
                }//end else

                return "M" + x + "," + y
                + "C" + cp1[0] + "," + cp1[1]
                + " " + cp2[0] + "," + cp2[1]
                + " " + parentX + "," + parentY;
            })
            .attr("stroke", "black")
            .style("stroke-width", "1.5px")
            .attr('marker-end', 'url(#arrowIntra)')
            .attr('fill', 'none')
            .on("mouseover", function(event,d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'inline');

                let coords = d3.pointer( event,  d3.select('.mainArea').select("#treeIcicleSVG").node());
        
                d3.select('.mainArea').select("#tooltip3").html( " <span class='tooltip-text-bold'>Start Node:</span> " + d.sourceName
                    + "<br/> <span class='tooltip-text-bold'>End Node:</span>" + d.targetName
                    + "<br/> <span class='tooltip-text-bold'>Edge Type:</span> " + d.edgeType)
                    .style("left", (coords[0] + transformXSvg) + "px")
                    .style("top", (coords[1]+ transformYSVG) + "px");

                let bb =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                //Pass right boundary
                if(bb.x + bb.width > window.innerWidth){
                    let diff = (bb.x + bb.width) - window.innerWidth;
                    d3.select('.mainArea').select("#tooltip3").style("left", (coords[0] + transformXSvg - diff ) + 'px')
                }
                let bb2 =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                //Pass bottom boundary
                if(bb2.y + bb2.height > window.innerHeight){
                    let diff = (bb2.y + bb2.height) - window.innerHeight;
                    d3.select('.mainArea').select("#tooltip3").style("top", (coords[1] + transformYSVG - diff ) + 'px')
                }

                d3.select(divId).select("#treeIcicleSVG").selectAll("path.link").style("opacity", function(d2,i2){
                    if(d2.source === d.source && d.target === d2.target && d2.edgeType === d.edgeType){
                        return 1;
                    }
                    return .1;
                })

                d3.select(divId).select("#treeIcicleSVG").selectAll("rect").attr("opacity", function(d2,i2){
                    if(d2.data.id === d.source || d2.data.id === d.target){
                        return 1;
                    }
                    return 0.5;
                })
                .attr("stroke", function(d2,i2){
                    if(d2.data.id === d.source || d2.data.id === d.target){
                        return "black";
                    }
                    return "#c6c6c6";
                })

                d3.select(divId).select("#treeIcicleSVG").selectAll("circle").style("fill", function(d2,i2){
                    if(d2.data.id === d.source || d2.data.id === d.target){
                        return "black";
                    }
                    return "gray";
                })
            })
            .on("mouseout", function(event, d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');
                d3.select(divId).select("#treeIcicleSVG").selectAll("circle").style("fill", "black")
                d3.select(divId).select("#treeIcicleSVG").selectAll("path.link").style("opacity", function(d2,i2){
                    return 1;
                });
                d3.select(divId).select("#treeIcicleSVG").selectAll("rect").attr("opacity", 1).attr("stroke", "#c6c6c6");
            })

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

            d3.select(divId).select("#treeIcicleG").selectAll("circle")
            .on("mouseover", function(event,d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'inline');

                let coords = d3.pointer( event,  d3.select('.mainArea').select("#treeIcicleSVG").node());

                //get number intra edges
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
        
                d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'> Node:</span>  " + d.data.name
                    + "<br/> <span class='tooltip-text-bold'>Node Type:</span>  " + d.data.type
                    + "<br/> <span class='tooltip-text-bold'># Intra Edges:</span>  " + totalEdges
                    + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span>  " + incomingEdges
                    + "<br/> <span class='tooltip-text-bold'># Outgoing Edges:</span>  " + outgoingEdges)
                    .style("left", (coords[0] + transformXSvg) + "px")
                    .style("top", (coords[1]+ transformYSVG) + "px");

                let bb =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                //Pass right boundary
                if(bb.x + bb.width > window.innerWidth){
                    let diff = (bb.x + bb.width) - window.innerWidth;
                    d3.select('.mainArea').select("#tooltip3").style("left", (coords[0] + transformXSvg - diff ) + 'px')
                }
                let bb2 =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                //Pass bottom boundary
                if(bb2.y + bb2.height > window.innerHeight){
                    let diff = (bb2.y + bb2.height) - window.innerHeight;
                    d3.select('.mainArea').select("#tooltip3").style("top", (coords[1] + transformYSVG - diff ) + 'px')
                }

                d3.select(divId).select("#treeIcicleG").selectAll("circle").style("fill", function(d2,i2){
                    if(d2.data.id === d.data.id){
                        return "black";
                    }
                    return "gray";
                })

                d3.select(divId).select("#treeIcicleG").selectAll("rect").attr("opacity", function(d2,i2){
                    if(d2.data.id === d.data.id){
                        return 1;
                    }
                    return 0.5;
                })
                .attr("stroke", function(d2, i2){
                    if(d2.data.id === d.data.id){
                        return "black";
                    }
                    return "#c6c6c6";
                })

                d3.select(divId).select("#treeIcicleG").selectAll("path.link").style("opacity", function(d2,i2){
                    if(d2 === undefined){
                        return 0;
                    }
                    else if(d2.source === d.data.id || d2.target === d.data.id){
                        return 1;
                    }

                    return .1;
                })
            })
        }//end if
        else if(prevProps.selectedTreeName !== this.props.selectedTreeName){
            console.log("props changed for intra dbllick", this.props.selectedTreeName);

            let myDuration = 1500;

            const divId = '#'+ this.props.id;
            d3.select(divId).select("#treeIcicleG").selectAll('rect').transition().duration(myDuration).style("opacity", 0);
            d3.select(divId).select("#treeIcicleG").selectAll('path').transition().duration(myDuration).style("opacity", 0);
            d3.select(divId).select("#treeIcicleG").selectAll('circle').transition().duration(myDuration).style("opacity", 0);
            this.drawTreeIcicleIntra = this.drawTreeIcicleIntra.bind(this);
            let ss = this.drawTreeIcicleIntra;
            
            setTimeout(function(){
                d3.select("#containerSVG").remove();
                ss();
            }, myDuration)
        }
    }//end component did update

    componentWillUnmount(){
        console.log("Unmount empty TreeIcicleIntra")
        window.removeEventListener("resize", this.redrawChart);
        d3.select('.mainArea').select("#tooltip3").remove();
    }//end componentWillUnmount function

    //Get the width of the div
    getWidth(){
        const divId = '#'+ this.props.id;
        return d3.select(divId).node().getBoundingClientRect().width;
    }//end getWidth function

    //Get the height of the main area
    getHeight(){
        return d3.select('.mainArea').node().getBoundingClientRect().height;
    }//end getHeight function

    redrawChart(){
        //Gets and resets the height and width
        console.log("redraw intra icicle ")
        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();

        //Redraw the direct chord diagram
        this.drawTreeIcicleIntra = this.drawTreeIcicleIntra.bind(this);
        this.drawTreeIcicleIntra();
    }//end redrawChart

    // Gets the tree hierarchy data given a name
    getSelectedTreeData(name, data){
        for(let i = 0; i < data.length; i++){
            if(data[i].name === name){
                return data[i];
            }
        }
        return -1;
    }//end getSelectedTreeData function

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

        ///Draws a ring of arrows around the icicle
    drawRing(svgContainer, func, dblFunc, selectedTreeName, treesInterData, treesIntraData, treeData, selectedMiniIcicleTreeName, networkData){
        console.log("in draw ring function for Intra");
        const treeNames = networkData[0];

        let biggerRectHeight = d3.select('.mainArea').node().getBoundingClientRect().height;
        let biggerRectWidth = d3.select('.mainArea').node().getBoundingClientRect().width;
        let smallerRect = d3.select("#treeIcicleSVG").node().getBoundingClientRect();

        console.log("ringr node ", d3.select("#treeIcicleSVG").node())
        console.log("ringr biggerRectHeight", biggerRectHeight, " smaller ",smallerRect.height);

        let quadrant1Transition = (biggerRectWidth/2)/((smallerRect.height / 2) + ((biggerRectHeight - smallerRect.height)/2));
        let quadrant1TransitionDegree = (Math.atan(quadrant1Transition))*(180/Math.PI)
        let quadrant2Transition = (-biggerRectHeight/2)/((smallerRect.width /2) + ((biggerRectWidth-smallerRect.width)/2))
        let quadrant2TransitionDegree = (((Math.atan(quadrant2Transition))*(180/Math.PI))* -1) + 90;
        let quadrant3Transition = (-biggerRectWidth/2)/((smallerRect.height /2) + ((biggerRectHeight-smallerRect.height)/2));
        let quadrant3TransitionDegree = (((Math.atan(quadrant3Transition))*(180/Math.PI))* -1) + 180;
        let quadrant4Transition = (-biggerRectHeight/2)/((smallerRect.width /2) + ((biggerRectWidth-smallerRect.width)/2));
        let quadrant4TransitionDegree = (((Math.atan(quadrant4Transition))*(180/Math.PI))* -1) + 270;

        let ringCoordinates = [];
        let index = 0;

        //Set the ring same as real minin chord diagram
        d3.select("#realMiniChordDiagramDiv").select("#treeArcs").selectAll("g").nodes().forEach(function(d,i){
            let degreeIt = Math.abs(d3.select(d).select("path").attr("degreeMidpoint") - 360);

            //in Quadrant1 top part
            if(degreeIt <= quadrant1TransitionDegree || degreeIt > quadrant4TransitionDegree ){
                console.log("ringr q1");
                let b = smallerRect.height / 2;
                let a =  (Math.tan(degreeIt * Math.PI / 180)) * b;
                let slope = a/b;
                let c = b + ((biggerRectHeight - smallerRect.height)/2);
                let y = c* slope;

                let x1 = biggerRectWidth/2 - y;
                let y1 = 0;
                let x2 = biggerRectWidth/2 - a;
                let y2 = (biggerRectHeight - smallerRect.height)/2;
                console.log("ringr y2", y2);

                let midpointX = (x1 + x2)/ 2;
                let midpointY = (y1 + y2)/ 2;
                let obj1 = {x: midpointX, y:midpointY, name: treeNames[index], degree:  d3.select(d).select("path").attr("degreeMidpoint")};
                ringCoordinates.push(obj1);
                
            }else if(degreeIt > quadrant1TransitionDegree && degreeIt <= quadrant2TransitionDegree){
                //IN Quadrant 2 left part
                console.log("ringr q2");
                let quad2Degree = 90 - degreeIt;
                let b = smallerRect.width /2;
                let a = (Math.tan(quad2Degree * Math.PI / 180)) * b;
                let slope = a/b;
                let c = b + ((biggerRectWidth-smallerRect.width)/2);
                let y =  slope*c;

                let x1 = 0;
                let y1 = (biggerRectHeight/2) - y;
                let x2 = c-b;
                let y2 = (biggerRectHeight/2) - a;

                let midpointX = (x1 + x2)/ 2;
                let midpointY = (y1 + y2)/ 2;
                let obj1 = {x: midpointX, y:midpointY, name: treeNames[index], degree:  d3.select(d).select("path").attr("degreeMidpoint")};
                ringCoordinates.push(obj1);
            }else if(degreeIt > quadrant2TransitionDegree && degreeIt <= quadrant3TransitionDegree){
                //IN Quadrant 3 bottom part
                console.log("ringr q3");
                let quad3Degree = 180 - degreeIt;
                let b = smallerRect.height /2;
                let a = (Math.tan(quad3Degree * Math.PI / 180)) * b;
                let slope = a/b;
                let c = b + ((biggerRectHeight-smallerRect.height)/2);
                let y =  slope*c;

                let x1 = biggerRectWidth/2 - y;
                let y1 = biggerRectHeight;
                let x2 =  biggerRectWidth/2 - a;
                let y2 = (biggerRectHeight/2) + b;

                let midpointX = (x1 + x2)/ 2;
                let midpointY = (y1 + y2)/ 2;
                let obj1 = {x: midpointX, y:midpointY, name: treeNames[index], degree:  d3.select(d).select("path").attr("degreeMidpoint")};
                ringCoordinates.push(obj1);
            }else{
                //IN Quadrant 4 right part
                console.log("ringr q4");
                let quad4Degree = 270 - degreeIt;
                let b = smallerRect.width /2;
                let a = (Math.tan(quad4Degree * Math.PI / 180)) * b;
                let slope = a/b;
                let c = b + ((biggerRectWidth-smallerRect.width)/2);
                let y =  slope*c;

                let x1 = biggerRectWidth;
                let y1 = (biggerRectHeight/2) + y;
                let x2 =  (biggerRectWidth/2) + b;
                let y2 = (biggerRectHeight/2) + a;

                let midpointX = (x1 + x2)/ 2;
                let midpointY = (y1 + y2)/ 2;
                let obj1 = {x: midpointX, y:midpointY,name: treeNames[index], degree:  d3.select(d).select("path").attr("degreeMidpoint")};
                ringCoordinates.push(obj1);
            }
            index++;
        })
        
        let ring = svgContainer.append('g').attr("id", "treeRing");

        let maxLengthArrow = (d3.select("#treeIcicleSVG").attr("y")) * .60;
        let diff = ((biggerRectHeight - smallerRect.height)/2) - d3.select("#treeIcicleSVG").attr("y");
        let diffX = ((biggerRectWidth - smallerRect.width)/2) - d3.select("#treeIcicleSVG").attr("x");
        let threshold = biggerRectHeight/2;
        let thresholdX = biggerRectWidth/2;
        let testArrow = [{"x": maxLengthArrow/2, "y": 0},
        {"x": maxLengthArrow, "y": (maxLengthArrow*0.30)},
        {"x": (maxLengthArrow * (3/4)), "y": (maxLengthArrow*0.30)},
        {"x": (maxLengthArrow * (3/4)), "y": maxLengthArrow},
        {"x": (maxLengthArrow/4), "y": maxLengthArrow}, 
        {"x": (maxLengthArrow/4), "y": (maxLengthArrow * 0.3)},
        {"x": 0, "y": (maxLengthArrow*.30)}];

        let getInterDataFunc = this.getSelectedTreeInterData;
        let getIntraDataFunc = this.getSelectedTreeIntraData;
        let getTreeDataFunc = this.getSelectedTreeData;

        ringCoordinates.forEach(function(d,i){
            console.log("ringr intra ", d)
            ring.append('g').selectAll("polygon")
            .data([testArrow])
          .enter().append("polygon")
            .attr("points",function(d2) { 
                return d2.map(function(d2) {
                    if(d.y < threshold){
                        if(d.x < thresholdX){
                            return [d2.x + d.x - (maxLengthArrow/2) -(diffX/2),d2.y + d.y- (maxLengthArrow/2) - (diff/2)].join(",");
                        }
                        return [d2.x + d.x - (maxLengthArrow/2) + (diffX/2),d2.y + d.y- (maxLengthArrow/2) - (diff/2)].join(",");
                    }else{
                        if(d.x < thresholdX){
                            return [d2.x + d.x - (maxLengthArrow/2) - (diffX/2),d2.y + d.y - (maxLengthArrow/2) + (diff/2)].join(",");

                        }
                        return [d2.x + d.x - (maxLengthArrow/2) + (diffX/2),d2.y + d.y - (maxLengthArrow/2) + (diff/2)].join(",");
                    }
                }).join(" ");
            })
            .style("fill", function(d2, i2){
                if(selectedMiniIcicleTreeName === null){
                    return "lightgray"
                }else{
                    if(d.name === selectedMiniIcicleTreeName){
                        return "dimgray";
                    }
                    return "lightgray";
                }
            })
            .attr("stroke", "black")
            .attr("transform", function(d2, i2){
                let midpointX = d.x - (diffX/2);
                let midpointY = d.y- (diff/2);
                if(d.y > threshold){
                    midpointY = d.y + (diff/2);
                }
                if(d.x > thresholdX){
                    midpointX = d.x + (diffX/2);
                }
                return "rotate("+ d.degree + "," + midpointX + "," + midpointY +  ")"
            })
            .style("opacity", function(d2, i2){
                if(d.name === selectedTreeName){
                    return 0.2;
                }
                return 1;
            })
            .attr("treeName", d.name)
            .on("mouseover", function(event, d2){
                console.log("hovered over ring ", d.name)
                if(d.name === selectedTreeName){
                    d3.select(this).style("cursor", "default"); 
                }else{  
                    d3.select(this).style("cursor", "pointer"); 

                    d3.select('.mainArea').select("#tooltip3").style('display', 'inline');
                    let coords = d3.pointer( event,  d3.select('.mainArea').select("#containerSVG").node());

                    //Get Inter data
                    const currentTreeInterData = getInterDataFunc(treesInterData, d.name);
                    let numberInterEdges = currentTreeInterData.length;

                    //Get Intra Data
                    const currentTreeIntraData = getIntraDataFunc(treesIntraData, d.name);
                    let numberIntraEdges = currentTreeIntraData.length;

                    //Get number nodes
                    const currentTreeData = getTreeDataFunc(d.name, treeData);
                    let treeRootNode = d3.hierarchy(currentTreeData);
                    treeRootNode.count();
                    let numNodes = treeRootNode.copy().sum(d => 1).value;

                    d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'>" + d.name
                    + "</span> <br/> # Nodes: " + numNodes
                    + "<br/> # Inter Edges: " + numberInterEdges
                    + "<br/> # Intra Edges: " + numberIntraEdges)
                    .style("left", (coords[0] ) + "px")
                    .style("top", (coords[1]) + "px");

                    let bb =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                    //Pass right boundary
                    if(bb.x + bb.width > window.innerWidth){
                        let diff = (bb.x + bb.width) - window.innerWidth;
                        d3.select('.mainArea').select("#tooltip3").style("left", (coords[0] - diff ) + 'px')
                    }
                    let bb2 =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                    //Pass bottom boundary
                    if(bb2.y + bb2.height > window.innerHeight){
                        let diff = (bb2.y + bb2.height) - window.innerHeight;
                        d3.select('.mainArea').select("#tooltip3").style("top", (coords[1] - diff ) + 'px')
                    }
                }//end else
            })
            .on("mouseout", function(event, d2){
                d3.select(this).style("cursor", "default"); 
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');
            })
            .on("click", function(event, d2){
                console.log(" ring clicked on ", d.name);
                if(d.name !== selectedTreeName){
                    func(true, d.name)

                    d3.select("#treeRing").selectAll("polygon").style("fill", function(d4, i4){
                        let currentTreeName = d3.select(d3.select(this).node()).attr("treeName");
                        if(currentTreeName === d.name){
                            return "dimgray"
                        }

                        return "lightgray";
                    })
                }
            })
            .on("dblclick", function(event,d2 ){
                console.log(" ring dble clicked on ", d.name);
                if(d.name !== selectedTreeName){
                    dblFunc(d.name);
                    func(false, null);
                }
            })
        })
    }//end drawRing function

    drawTreeIcicleIntra(){
        console.log("In drawTreeIcicleIntra with  tree ", this.props.selectedTreeName,
        " and other props ", this.props);

        const divId = '#'+ this.props.id;
        let height = this.state.height ;
        const stateWidth = this.state.width;

        //Set height of div
        d3.select(divId).attr("class", "overDivs");

        const divSmall = 1.5;
        let width = this.state.width / divSmall;
        let originalWidth = this.state.width / divSmall;
        let originalHeight = this.state.height /divSmall;


        function zoomed({transform}) {
            svg.attr("transform", transform);
        }
        function zoomedEnd(){}
        let zoomTotal = d3.zoom()
                .scaleExtent([1/4, 100])
                .on("zoom", zoomed)
                .on("end", zoomedEnd);
                
        let transformXSvg = this.state.width/2 - (originalWidth/2);
        let transformYSVG = this.state.height/2 - (originalHeight/2);
        let containerSVG = d3.select(divId).append('svg').attr("id", "containerSVG").attr("width", stateWidth).attr("height", height)

        const svg = containerSVG.append('svg').attr("id", "treeIcicleSVG").attr("width", width).attr("height", height/divSmall)
            .attr("y", transformYSVG)
            .attr("x", transformXSvg)
            .call(zoomTotal).append('g').attr("id", "treeIcicleG");

        containerSVG.append("rect")
            .attr("id", "rectBorder")
            .attr("x", transformXSvg)
            .attr("y", transformYSVG)
            .attr("height", height/divSmall)
            .attr("width", width)
            .style("stroke", "black")
            .style("fill", "none")
            .style("stroke-width", 2);

        //get the data formatted for tree/icicle
        const selectedTreeName = this.props.selectedTreeName;
        const currentTreeData = this.getSelectedTreeData(selectedTreeName, this.props.treeData)
        if(currentTreeData === -1){
            console.log("Error no tree in the data with ", selectedTreeName)
            return;
        }

        let partition = d3.partition().size([width, height/divSmall]).padding(2);
        let rootNode = d3.hierarchy(currentTreeData);
        rootNode.count()
        partition(rootNode);
        let radius = 8;
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
        }//end while loop

        let transformIdentity = d3.zoomIdentity.translate(transformXSvg, transformYSVG)
        d3.select(divId).select("#treeIcicleSVG").call(zoomTotal.transform, transformIdentity )
        const nodeTypes = this.props.uniqueNodeTypesAllTrees;
        const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#ffffb3'];
        const color = d3.scaleOrdinal( )
        .domain(nodeTypes)
        .range(colorSet);

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
            .attr("stroke", "#c6c6c6")
            .on("mouseover", function(event, d){
                svg.selectAll("circle").style("fill", function(d2,i2){
                    if(d2.data.id === d.data.id){
                        return "black";
                    }
                    return "gray";
                })

                svg.selectAll("rect").attr("opacity", function(d2,i2){
                    if(d2.data.id === d.data.id){
                        return 1;
                    }
                    return 0.5;
                })
                .attr("stroke", function(d2, i2){
                    if(d2.data.id === d.data.id){
                        return "black";
                    }
                    return "#c6c6c6";
                })

                svg.selectAll("path.link").style("opacity", function(d2,i2){
                    if(d2 === undefined){
                        return 0;
                    }
                    else if(d2.source === d.data.id || d2.target === d.data.id){
                        return 1;
                    }

                    return .1;
                })
            })
            .on("mouseout", function(event, d){
                svg.selectAll("circle").style("fill", "black")
                svg.selectAll("rect").attr("opacity", 1).attr("stroke", "#c6c6c6");
                svg.selectAll("path.link").style("opacity", function(d2,i2){
                    return 1;
                });
            })

        //Note: rows are source and columns are target
        const selectedTreeIntraData = this.getSelectedTreeIntraData(this.props.treeIntraData, this.props.selectedTreeName);
        let treeIntraDataFormatted = [];
        for(let i = 0; i < selectedTreeIntraData.length; i++){
            let obj1 = {};
            obj1.source = selectedTreeIntraData[i].startNodeID;
            obj1.target = selectedTreeIntraData[i].endNodeID;
            obj1.edgeType= selectedTreeIntraData[i].edgeType;
            obj1.sourceName = selectedTreeIntraData[i].startNode;
            obj1.targetName = selectedTreeIntraData[i].endNode;
            treeIntraDataFormatted.push(obj1);
        }//end for loop

        let markerWidth = 8;
        d3.select('.mainArea').select("#tooltip3").style('display', 'none');
        svg
            .append('defs')
            .append('marker')
            .attr('id', 'arrowIntra')
            .attr('viewBox', [0, -5, 10, 10])
            .attr('refX', 0)
            .attr('refY', 0)
            .attr('markerWidth', markerWidth)
            .attr('markerHeight', markerWidth)
            .attr('orient', 'auto-start-reverse')
            .attr("markerUnits", "userSpaceOnUse")
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('stroke', 'black');

        let pathPoints = [];

        svg.append('g').attr("id", "pathEdges").selectAll(".link")
            .data(treeIntraDataFormatted)
            .join('path')
            .attr("class", "link")
            .attr("d", function(d){
                let sourceData = null;
                let targetData = null;
                let currentPathObj = {};

                for(let index = 0; index < rootNode.descendants().length; index++ ){
                    if(sourceData == null || targetData == null){
                        if(rootNode.descendants()[index].data.id === d.source){
                            sourceData = rootNode.descendants()[index]
                        }else if(rootNode.descendants()[index].data.id === d.target){
                            targetData = rootNode.descendants()[index];
                        }
                    }else{
                        break;
                    }

                }

                let x = (sourceData.x0 + sourceData.x1 )/ 2;
                let y = ( sourceData.y1 + sourceData.y0 )/ 2;
                let parentX = (targetData.x0 + targetData.x1 )/ 2;
                let parentY = (targetData.y0 + targetData.y1 )/ 2;

                let markerAddSubtract = "add";

                if(y === parentY && x < parentX){
                    parentX = parentX- (markerWidth*2);
                    markerAddSubtract = "subtract";
                }else if(y === parentY && x > parentX){
                    parentX = parentX + (markerWidth*2);
                }else if(x === parentX && y < parentY){
                    parentY = parentY - (markerWidth*2);
                    markerAddSubtract = "subtract";
                }else if(x === parentX &&  y> parentY){
                    parentY = parentY + (markerWidth*2);
                }else if(x < parentX && y < parentY){
                    parentY = parentY - (markerWidth*2);
                    markerAddSubtract = "subtract";
                }else if(x < parentX && y > parentY){
                    parentY = parentY + (markerWidth*2)
                }else if(x > parentX && y > parentY){
                    parentY = parentY + (markerWidth*2)
                }else if(x > parentX && y < parentY){
                    parentY = parentY - (markerWidth*2);
                    markerAddSubtract = "subtract";
                }

                let cp1 = [x, (y+parentY)/2];
                let cp2 = [parentX , (y+parentY)/2];

                if(pathPoints.length === 0){
                    currentPathObj.startNode = d.source;
                    currentPathObj.endNode = d.target;
                    currentPathObj.points = [];
                    let temp = {};
                    temp.startPoint = [x, y];
                    temp.control1 = [x, (y+parentY)/2];
                    temp.control2 = [parentX, (y+parentY)/2];
                    temp.endPoint = [parentX, parentY];
                    temp.subAdd = markerAddSubtract;
                    temp.belowAbove = "middle";
                    currentPathObj.points.push(temp);
                    pathPoints.push(currentPathObj);
                }else{
                    //Check if horz, vert or diag
                    let horz = false;
                    let vert = false;

                    if(y === parentY){
                        horz = true;
                    }else if(x === parentX ){
                        vert = true;
                    }


                    if(horz){
                        //Check if same points or opposite
                        let foundPathPoints = -1;

                        for(let j = 0; j < pathPoints.length; j++){
                            if((pathPoints[j].startNode === d.source && pathPoints[j].endNode === d.target)
                            || (pathPoints[j].startNode === d.target && pathPoints[j].endNode === d.source)){
                                foundPathPoints = j;
                                break;
                            }
                        }

                        if(foundPathPoints !== -1){
                            // found a path points match

                            if(pathPoints[foundPathPoints].startNode === d.target && pathPoints[foundPathPoints].endNode === d.source ){
                                //go below
                                let mult = 1;
                                if(pathPoints[foundPathPoints].points.length !== 1){
                                    pathPoints[foundPathPoints].points.forEach(function(d2, i2){
                                        if(d2.belowAbove === "below"){
                                            mult++;
                                        }
                                    })
                                }
                                cp1[1] += (20 * mult);
                                cp2[1] += (20 * mult);

                                let mult2 = ((mult-1) * 0.2)
                                let mult3 = ((mult-1) * 0.15)

                                if(markerAddSubtract === "add"){
                                    parentX = parentX - (markerWidth*(1+ mult2));
                                }else{
                                    parentX = parentX + (markerWidth*(1+ mult2));
                                }
                                parentY = parentY + (markerWidth*(1.5+ mult3));

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "below";
                                pathPoints[foundPathPoints].points.push(temp);

                            }else{
                                //go above
                                let mult = 1;
                                if(pathPoints[foundPathPoints].points.length !== 1){
                                    pathPoints[foundPathPoints].points.forEach(function(d2, i2){
                                        if(d2.belowAbove === "above"){
                                            mult++;
                                        }
                                    })
                                }
                                cp1[1] -= (20 * mult);
                                cp2[1] -= (20 * mult);

                                let mult2 = ((mult-1) * 0.2)
                                let mult3 = ((mult-1) * 0.15)

                                if(markerAddSubtract === "add"){
                                    parentX = parentX - (markerWidth*(1+ mult2));
                                }else{
                                    parentX = parentX + (markerWidth*(1+ mult2));
                                }
                                parentY = parentY - (markerWidth*(1.5 + mult3));

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "above";
                                pathPoints[foundPathPoints].points.push(temp);
                            }
                        }else{
                            //found NO path points match
                            currentPathObj.startNode = d.source;
                            currentPathObj.endNode = d.target;
                            currentPathObj.points = [];
                            let temp = {};
                            temp.startPoint = [x, y];
                            temp.control1 = [x, (y+parentY)/2];
                            temp.control2 = [parentX, (y+parentY)/2];
                            temp.endPoint = [parentX, parentY];
                            temp.subAdd = markerAddSubtract;
                            temp.belowAbove = "middle"
                            currentPathObj.points.push(temp);
                            pathPoints.push(currentPathObj);
                        }

                    }else if(vert){

                        let foundPathPoints = -1;
                        for(let j = 0; j < pathPoints.length; j++){
                            if((pathPoints[j].startNode === d.source && pathPoints[j].endNode === d.target)
                            || (pathPoints[j].startNode === d.target && pathPoints[j].endNode === d.source)){
                                foundPathPoints = j;
                                break;
                            }
                        }

                        if(foundPathPoints !== -1){
                            if(pathPoints[foundPathPoints].startNode === d.target && pathPoints[foundPathPoints].endNode === d.source ){
                                //Go right
                                let mult = 1;
                                if(pathPoints[foundPathPoints].points.length !== 1){
                                    pathPoints[foundPathPoints].points.forEach(function(d2, i2){
                                        if(d2.belowAbove === "below"){
                                            mult++;
                                        }
                                    })
                                }

                                cp1[0] += (20 * mult);
                                cp2[0] += (20 * mult);

                                let mult2 = ((mult-1) * 0.2)
                                let mult3 = ((mult-1) * 0.15)

                                if(markerAddSubtract === "add"){
                                    parentY = parentY - (markerWidth*(1+mult2));
                                }else{
                                    parentY = parentY + (markerWidth*(1+mult2));
                                }
                                parentX = parentX + (markerWidth*(1.5+ mult3));

                                
                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "below";
                                pathPoints[foundPathPoints].points.push(temp);

                            }else{
                                //Go left
                                let mult = 1;
                                if(pathPoints[foundPathPoints].points.length !== 1){
                                    pathPoints[foundPathPoints].points.forEach(function(d2, i2){
                                        if(d2.belowAbove === "above"){
                                            mult++;
                                        }
                                    })
                                }
                                cp1[0] -= (20 * mult);
                                cp2[0] -= (20 * mult);

                                let mult2 = ((mult-1) * 0.2)
                                let mult3 = ((mult-1) * 0.15)

                                if(markerAddSubtract === "add"){
                                    parentY = parentY - (markerWidth*(1+mult2));
                                }else{
                                    parentY = parentY + (markerWidth*(1+mult2));
                                }
                                parentX = parentX - (markerWidth*(1.5+ mult3));

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "above";
                                pathPoints[foundPathPoints].points.push(temp);
                            }

                        }else{
                            currentPathObj.startNode = d.source;
                            currentPathObj.endNode = d.target;
                            currentPathObj.points = [];
                            let temp = {};
                            temp.startPoint = [x, y];
                            temp.control1 = [x, (y+parentY)/2];
                            temp.control2 = [parentX, (y+parentY)/2];
                            temp.endPoint = [parentX, parentY];
                            temp.subAdd = markerAddSubtract;
                            temp.belowAbove = "middle"
                            currentPathObj.points.push(temp);
                            pathPoints.push(currentPathObj);
                        }


                    }else{
                        let foundPathPoints = -1;

                        for(let j = 0; j < pathPoints.length; j++){
                            if((pathPoints[j].startNode === d.source && pathPoints[j].endNode === d.target)){
                                foundPathPoints = j;
                                break;
                            }
                        }

                        if(foundPathPoints !== -1){
                            let caseNumber = -1;
                            if(x < parentX && y < parentY){
                                caseNumber = 0;
                            }else if(x < parentX && y > parentY){
                                caseNumber = 1;
                            }else if(x > parentX && y > parentY){
                                caseNumber = 2;
                            }else if(x > parentX && y < parentY){
                                caseNumber = 3;
                            }

                            if(caseNumber === 0){
                                // console.log("IN CASE 0 NUMBER");
                                let mult = pathPoints[foundPathPoints].points.length;

                                cp1[1] -= (20 * mult);
                                cp2[1] -= (20 * mult);

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                pathPoints[foundPathPoints].points.push(temp);
                            }else if(caseNumber === 1){
                                // console.log("IN CASE 1 NUMBER");
                                let mult = pathPoints[foundPathPoints].points.length;

                                cp1[1] += (20 * mult);
                                cp2[1 ]+= (20 * mult);

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                pathPoints[foundPathPoints].points.push(temp);

                            }else if(caseNumber === 2){
                                // console.log("IN CASE 2 NUMBER");
                                let mult = pathPoints[foundPathPoints].points.length;
                                cp1[1] += (20 * mult);
                                cp2[1] += (20 * mult);

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                pathPoints[foundPathPoints].points.push(temp);

                            }else if(caseNumber === 3){
                                // console.log("IN CASE 3 NUMBER");
                                let mult = pathPoints[foundPathPoints].points.length;
                                cp1[1] -= (20 * mult);
                                cp2[1] -= (20 * mult);

                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                pathPoints[foundPathPoints].points.push(temp);
                            }

                        }else{
                            currentPathObj.startNode = d.source;
                            currentPathObj.endNode = d.target;
                            currentPathObj.points = [];
                            let temp = {};
                            temp.startPoint = [x, y];
                            temp.control1 = [x, (y+parentY)/2];
                            temp.control2 = [parentX, (y+parentY)/2];
                            temp.endPoint = [parentX, parentY];
                            temp.subAdd = markerAddSubtract;
                            temp.belowAbove = "middle"
                            currentPathObj.points.push(temp);
                            pathPoints.push(currentPathObj);
                        }
                    }
                }//end else

                return "M" + x + "," + y
                + "C" + cp1[0] + "," + cp1[1]
                + " " + cp2[0] + "," + cp2[1]
                + " " + parentX + "," + parentY;
            })
            .attr("stroke", "black")
            .style("stroke-width", "1.5px")
            .attr('marker-end', 'url(#arrowIntra)')
            .attr('fill', 'none')
            .on("mouseover", function(event,d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'inline');
                let coords = d3.pointer( event,  d3.select('.mainArea').select("#treeIcicleSVG").node());
        
                d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'>  Start Node:</span>  " + d.sourceName
                    + "<br/> <span class='tooltip-text-bold'> End Node: </span>" + d.targetName
                    + "<br/> <span class='tooltip-text-bold'> Edge Type: </span> " + d.edgeType)
                    .style("left", (coords[0] + transformXSvg) + "px")
                    .style("top", (coords[1]+ transformYSVG) + "px");

                let bb =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                //Pass right boundary
                if(bb.x + bb.width > window.innerWidth){
                    let diff = (bb.x + bb.width) - window.innerWidth;
                    d3.select('.mainArea').select("#tooltip3").style("left", (coords[0] + transformXSvg - diff ) + 'px')
                }
                let bb2 =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                //Pass bottom boundary
                if(bb2.y + bb2.height > window.innerHeight){
                    let diff = (bb2.y + bb2.height) - window.innerHeight;
                    d3.select('.mainArea').select("#tooltip3").style("top", (coords[1] + transformYSVG - diff ) + 'px')
                }

                svg.selectAll("path.link").style("opacity", function(d2,i2){
                    if(d2.source === d.source && d.target === d2.target && d2.edgeType === d.edgeType){
                        return 1;
                    }

                    return .1;
                })

                svg.selectAll("rect").attr("opacity", function(d2,i2){
                    if(d2.data.id === d.source || d2.data.id === d.target){
                        return 1;
                    }
                    return 0.5;
                })
                .attr("stroke", function(d2,i2){
                    if(d2.data.id === d.source || d2.data.id === d.target){
                        return "black";
                    }
                    return "#c6c6c6";
                })

                svg.selectAll("circle").style("fill", function(d2,i2){
                    if(d2.data.id === d.source || d2.data.id === d.target){
                        return "black";
                    }
                    return "gray";
                })
            })
            .on("mouseout", function(event, d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');
                svg.selectAll("circle").style("fill", "black")
                svg.selectAll("path.link").style("opacity", function(d2,i2){
                    return 1;
                });
                svg.selectAll("rect").attr("opacity", 1).attr("stroke", "#c6c6c6");
            })

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
            .on("mouseover", function(event,d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'inline');
                let coords = d3.pointer( event,  d3.select('.mainArea').select("#treeIcicleSVG").node());

                //get number intra edges
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
        
                d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'> Node:</span>  " + d.data.name
                    + "<br/> <span class='tooltip-text-bold'>Node Type:</span>  " + d.data.type
                    + "<br/> <span class='tooltip-text-bold'># Intra Edges:</span>  " + totalEdges
                    + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span>  " + incomingEdges
                    + "<br/> <span class='tooltip-text-bold'># Outgoing Edges:</span>  " + outgoingEdges)
                    .style("left", (coords[0] + transformXSvg) + "px")
                    .style("top", (coords[1]+ transformYSVG) + "px");

                let bb =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                //Pass right boundary
                if(bb.x + bb.width > window.innerWidth){
                    let diff = (bb.x + bb.width) - window.innerWidth;
                    d3.select('.mainArea').select("#tooltip3").style("left", (coords[0] + transformXSvg - diff ) + 'px')
                }
                let bb2 =  d3.select('.mainArea').select("#tooltip3").node().getBoundingClientRect();
                //Pass bottom boundary
                if(bb2.y + bb2.height > window.innerHeight){
                    let diff = (bb2.y + bb2.height) - window.innerHeight;
                    d3.select('.mainArea').select("#tooltip3").style("top", (coords[1] + transformYSVG - diff ) + 'px')
                }

                svg.selectAll("circle").style("fill", function(d2,i2){
                    if(d2.data.id === d.data.id){
                        return "black";
                    }
                    return "gray";
                })

                svg.selectAll("rect").attr("opacity", function(d2,i2){
                    if(d2.data.id === d.data.id){
                        return 1;
                    }
                    return 0.5;
                })
                .attr("stroke", function(d2, i2){
                    if(d2.data.id === d.data.id){
                        return "black";
                    }
                    return "#c6c6c6";
                })

                svg.selectAll("path.link").style("opacity", function(d2,i2){
                    if(d2 === undefined){
                        return 0;
                    }
                    else if(d2.source === d.data.id || d2.target === d.data.id){
                        return 1;
                    }

                    return .1;
                })
            })
            .on("mouseout", function(event, d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');

                svg.selectAll("circle").style("fill", "black");
                svg.selectAll("path.link").style("opacity", function(d2,i2){
                    return 1;
                });
                svg.selectAll("rect").attr("opacity", 1)
                .attr("stroke", "#c6c6c6");
            })

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
        d3.select(divId).select("#treeIcicleSVG").call(zoomTotal.transform,
            d3.zoomIdentity.translate(translate1[0], translate1[1]).scale(scale1));

        this.drawRing(containerSVG, this.props.handleMiniIcicleChange, this.props.handleRingDblClickChange,
            this.props.selectedTreeName,
            this.props.treesInterData,
            this.props.treeIntraData,
            this.props.treeData,
            this.props.selectedMiniIcicleTreeName,
            this.props.networkData
            );

        d3.select(divId).style("height", 5 + 'px');
        d3.select("#treeIcicle").raise();
        d3.select("#helpIconDiv").raise();
        d3.select("#tooltip").raise();
        d3.select("#tooltip3").raise();
    }//end drawEmptyMiniChordDiagram function

    render(){
        console.log("Rendering for TreeIcicleIntra")
      
        return <div id={this.props.id} ref={this.chartRef} ></div>
    }//end render function
}//end class

export default TreeIcicleIntra;