import React from 'react';
import * as d3 from "d3";

class TreeIcicleInter extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of TreeIcicleInter");
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In componenet did mount for TreeIcicleInter");

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawTreeIcicleInter();
        })

        d3.select('.mainArea').append('div')
        .attr("class", "myTooltip")
        .attr("id", "tooltip3")

        window.addEventListener("resize", this.redrawChart);
    }//end componenrDidMount function

    componentDidUpdate(prevProps, prevState){
        console.log("In componenet did update for TreeIcicleInter");
        if((prevProps.selectedEdgeNamesInterFilter !== this.props.selectedEdgeNamesInterFilter)
        || (prevProps.selectedNodeNamesInterFilter !== this.props.selectedNodeNamesInterFilter)
        || (prevProps.selectedNodeTypesInterFilter !== this.props.selectedNodeTypesInterFilter)
        || (prevProps.selectedDirectionInterFilter !== this.props.selectedDirectionInterFilter)){
            console.log("props filter changed for inter", this.props);
            const selectedEdgeNamesInterFilter =this.props.selectedEdgeNamesInterFilter;
            const selectedNodeNamesInterFilter = this.props.selectedNodeNamesInterFilter;
            const selectedNodeTypesInterFilter = this.props.selectedNodeTypesInterFilter;
            const selectedDirectionInterFilter = this.props.selectedDirectionInterFilter;

            const selectedTreeName = this.props.selectedTreeName;
            const selectedTreeInterData = this.getSelectedTreeInterData(this.props.treesInterData, selectedTreeName);

            const divId = '#'+ this.props.id;
            let svgContainer = d3.select(divId).select("#containerSVG");
            let smallerRectWidth = d3.select("#treeIcicleSVG").attr("originalWidth");
            let smallerRectHeight = d3.select("#treeIcicleSVG").attr("originalHeight");

            const divSmall = 1.5;
            let originalWidth = this.state.width / divSmall;
            let originalHeight = this.state.height /divSmall;
            var transformXSvg = this.state.width/2 - (originalWidth/2);
            var transformYSVG = this.state.height/2 - (originalHeight/2);

            let transform =  (d3.select("#treeIcicleG").attr("transform")).split(" ");
            let translate = (((transform[0].slice(0,-1)).split("("))[1]).split(",");
            let scale = (((transform[1].slice(0,-1)).split("("))[1]);

            let icicleX = d3.select("#treeIcicleSVG").attr("x");
            let icicleY = d3.select("#treeIcicleSVG").attr("y");
    
            let minx = parseFloat(d3.select("#treeIcicleSVG").attr("x"));
            let maxx = parseFloat(d3.select("#treeIcicleSVG").attr("x")) + parseFloat(smallerRectWidth);
            let miny = parseFloat(d3.select("#treeIcicleSVG").attr("y"));
            let maxy = parseFloat(d3.select("#treeIcicleSVG").attr("y")) + parseFloat(smallerRectHeight);
    
            let props1 = this.props;
            let state1 = this.state;
            let drawingArrows = this.drawInterEdges;
            //Get filtered data
            let filteredTreeInterData = [];
            let filteredTreeInterDataFormatZoom = [];

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
                    if(selectedTreeInterData[i].startTree === selectedTreeName){
                        let realX;
                        let realY;
    
                        d3.select("#treeIcicleG").selectAll("circle").nodes().forEach(function(d,i2){
                            if(d3.select(d).data()[0].data.id === selectedTreeInterData[i].startNodeID){
                                    realX = parseFloat(translate[0]) + ((d3.select(d).attr("cx"))*scale) + parseFloat(icicleX)
                                    realY = parseFloat(translate[1]) + ((d3.select(d).attr("cy"))*scale) +  parseFloat(icicleY)
                            }
                        })
                        let endRealX = null;
                        let endRealY = null;
        
                        for(let j = 0; j < d3.select("#treeRing").selectAll("polygon").nodes().length; j++){
                            if(endRealX === null){
                                if(d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("treeName") === selectedTreeInterData[i].endTree ){
                                    let polygonPoints = d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("points").split(" ");
                                    let polygonTransformation = d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("transform");
                                    let polygoTransArr = polygonTransformation.split("(")[1].slice(0,-1).split(",");
                                    let x3 = (parseFloat(polygonPoints[3].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    - (parseFloat(polygonPoints[3].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    + parseFloat(polygoTransArr[1]);
                                    let y3 = (parseFloat(polygonPoints[3].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    + (parseFloat(polygonPoints[3].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    + parseFloat(polygoTransArr[2]);
                                    let rotatedPolygonPoint3 = [ x3, y3];
                                    let x4 = (parseFloat(polygonPoints[4].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    - (parseFloat(polygonPoints[4].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    + parseFloat(polygoTransArr[1]);
                                    let y4 = (parseFloat(polygonPoints[4].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    + (parseFloat(polygonPoints[4].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    + parseFloat(polygoTransArr[2]);
                                    let rotatedPolygonPoint4 = [ x4, y4];
                                    let midpointEnd = [(rotatedPolygonPoint3[0] + rotatedPolygonPoint4[0])/2, (rotatedPolygonPoint3[1] + rotatedPolygonPoint4[1])/2];
                                    
                                    endRealX = midpointEnd[0];
                                    endRealY = midpointEnd[1];
                                }//end if
                            }//end if
                        }//end for loop
    
                        let obj = {startX: realX, startY: realY, endX: endRealX, endY: endRealY, myData: selectedTreeInterData[i] };
                        filteredTreeInterData.push(obj);
                        filteredTreeInterDataFormatZoom.push(selectedTreeInterData[i]);
                    }else{
                        let realX = null;
                        let realY ;
    
                        for(let j = 0; j < d3.select("#treeRing").selectAll("polygon").nodes().length; j++){
                            if(realX === null){
                                if(d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("treeName") === selectedTreeInterData[i].startTree ){
                                    let polygonPoints = d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("points").split(" ");
                                    let polygonTransformation = d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("transform");
                                    let polygoTransArr = polygonTransformation.split("(")[1].slice(0,-1).split(",");
                                    let x3 = (parseFloat(polygonPoints[3].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                     - (parseFloat(polygonPoints[3].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                     + parseFloat(polygoTransArr[1]);
                                     let y3 = (parseFloat(polygonPoints[3].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                     + (parseFloat(polygonPoints[3].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                     + parseFloat(polygoTransArr[2]);
                                    let rotatedPolygonPoint3 = [ x3, y3];
                                    let x4 = (parseFloat(polygonPoints[4].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    - (parseFloat(polygonPoints[4].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    + parseFloat(polygoTransArr[1]);
                                    let y4 = (parseFloat(polygonPoints[4].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    + (parseFloat(polygonPoints[4].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                                    + parseFloat(polygoTransArr[2]);
                                    let rotatedPolygonPoint4 = [ x4, y4];
                                    let midpointEnd = [(rotatedPolygonPoint3[0] + rotatedPolygonPoint4[0])/2, (rotatedPolygonPoint3[1] + rotatedPolygonPoint4[1])/2];
                                    realX = midpointEnd[0];
                                    realY = midpointEnd[1];
                                }//end if
                            }//end if
                        }//end for loop
    
                        let endRealX = null;
                        let endRealY = null;
                        d3.select("#treeIcicleG").selectAll("circle").nodes().forEach(function(d,i2){
                            if(d3.select(d).data()[0].data.id === selectedTreeInterData[i].endNodeID){
                                endRealX = parseFloat(translate[0]) + ((d3.select(d).attr("cx"))*scale) + parseFloat(icicleX)
                                endRealY = parseFloat(translate[1]) + ((d3.select(d).attr("cy"))*scale) +  parseFloat(icicleY)
                            }
                        })
    
                        let obj = {startX: realX, startY: realY, endX: endRealX, endY: endRealY, myData: selectedTreeInterData[i] };
                        filteredTreeInterData.push(obj);
                        filteredTreeInterDataFormatZoom.push(selectedTreeInterData[i]);
                    }//end else
                }//end if
            }//end for loop

            function zoomed({transform}) {
                svg.attr("transform", transform);
                //make arrow dissappear
                svgContainer.select("#arrows").remove();
            }
            function zoomedEnd(){
                //Here rerender the arrowsdr
                let scaleString = parseFloat(((svg.attr("transform").split(" ")[1]).split("(")[1]).slice(0, -1));
               drawingArrows(svgContainer, props1, state1, filteredTreeInterDataFormatZoom, scaleString);
            }
            let zoomTotal = d3.zoom()
                    .scaleExtent([1/4, 100])
                    .on("zoom", zoomed)
                    .on("end", zoomedEnd);

            svgContainer.select("#treeIcicleSVG").call(zoomTotal);
            let svg = svgContainer.select("#treeIcicleG")

            let markerWidth = 8;
            svgContainer.selectAll("defs").remove();
            svgContainer
            .append('defs')
            .append('marker')
            .attr('id', 'arrowInter')
            .attr('viewBox', [0, -5, 10, 10])
            .attr('refX', 0)
            .attr('refY', 0)
            .attr('markerWidth', markerWidth)
            .attr('markerHeight', markerWidth)
            .attr('orient', 'auto')
            .attr("markerUnits", "userSpaceOnUse")
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('stroke', 'black');

            svgContainer
            .append('defs')
            .append('marker')
            .attr('id', 'arrowInterEmpty')
            .attr('viewBox', [0, -5, 10, 10])
            .attr('refX', 0)
            .attr('refY', 0)
            .attr('markerWidth', markerWidth)
            .attr('markerHeight', markerWidth)
            .attr('orient', 'auto')
            .attr("markerUnits", "userSpaceOnUse")
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('stroke', 'none')
            .attr("fill", "none");

            let pathPoints = [];
            let scaleValue = parseFloat(((svg.attr("transform").split(" ")[1]).split("(")[1]).slice(0, -1));

            //Draw lines
            svgContainer.select("#arrows").selectAll("path")
            .data(filteredTreeInterData)
            .join("path")
            .attr("d", function(d){
                let currentPathObj = {};
    
                let x = d.startX;
                let y = d.startY;
                let parentX = d.endX;
                let parentY = d.endY;
                let markerMult = 2;
    
                let markerAddSubtract = "add";
                if(d.myData.endTree !== selectedTreeName){
                    markerMult = 1;
                    markerWidth = 8;
                }else{
                    if(scaleValue < 1){
                        markerWidth = 8 * scaleValue;
                    }else{
                        markerWidth = 8 * (scaleValue - ((scaleValue-1)/2));
                    }
                }

                if(y === parentY && x < parentX){
                    parentX = parentX- (markerWidth*markerMult);
                    markerAddSubtract = "subtract";
                    // console.log("y same x small ");
                }else if(y === parentY && x > parentX){
                    parentX = parentX + (markerWidth*markerMult);
                    // console.log("y same x large ");
                }else if(x === parentX && y < parentY){
                    parentY = parentY - (markerWidth*markerMult);
                    markerAddSubtract = "subtract";
                    // console.log("x same y small ");
                }else if(x === parentX &&  y> parentY){
                    parentY = parentY + (markerWidth*markerMult);
                    // console.log("x same y large ");
                }else if(x < parentX && y < parentY){
                    //console.log("x small y small ");
                    if(parentY - y > markerWidth*markerMult){
                        //console.log("normal change")
                        parentY = parentY - (markerWidth*markerMult);
                    }else{
                        //console.log("changeing difference")
                        let minDiff = parentY- y - 0.000001;
                        parentY = parentY - minDiff;
                    }
                    markerAddSubtract = "subtract";
                }else if(x < parentX && y > parentY){
                    //console.log("x small y large ");
                    if(y - parentY > (markerWidth*markerMult)){
                        parentY = parentY + (markerWidth*markerMult);
                    }else{
                        let minDiff = y- parentY - 0.000001;
                        parentY = parentY + minDiff;
                    }
                }else if(x > parentX && y > parentY){
                    if(y - parentY > (markerWidth*markerMult)){
                        parentY = parentY + (markerWidth*markerMult);
                    }else{
                        let minDiff = y- parentY - 0.000001;
                        parentY = parentY + minDiff;
                    }
                    // console.log("x large y large ");
                }else if(x > parentX && y < parentY){
                    if(parentY - y > markerWidth*markerMult){
                        //console.log("normal change")
                        parentY = parentY - (markerWidth*markerMult);
                    }else{
                        //console.log("changeing difference")
                        let minDiff = parentY- y - 0.000001;
                        parentY = parentY - minDiff;
                    }
                    markerAddSubtract = "subtract";
                     //console.log("x large y small ");
                }
    
                let cp1 = [x, (y+parentY)/2];
                let cp2 = [parentX , (y+parentY)/2];
    
                if(pathPoints.length === 0){
                    currentPathObj.startNode = d.myData.startNodeID;
                    currentPathObj.startTree = d.myData.startTree;
                    currentPathObj.endNode = d.myData.endNodeID;
                    currentPathObj.endTree = d.myData.endTree;
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
                    let horz = false;
                    let vert = false;
                    let diag = false;
    
                    if(y === parentY){
                        horz = true;
                    }else if(x === parentX ){
                        vert = true;
                    }else{
                        diag = true;
                    }//end else
    
                    if(horz){
                        let foundPathPoints = -1;
    
                        for(let j = 0; j < pathPoints.length; j++){
                            if(d.myData.endTree !== selectedTreeName){
                                if(pathPoints[j].startNode === d.myData.startNodeID && pathPoints[j].startTree === d.myData.startTree
                                    && pathPoints[j].endTree === d.myData.endTree){
                                    foundPathPoints = j;
                                    break;
                                }
                            }else{
                                if(pathPoints[j].endNode === d.myData.endNodeID && pathPoints[j].endTree === d.myData.endTree
                                && pathPoints[j].startTree === d.myData.startTree){
                                        foundPathPoints = j;
                                        break;
                                }
                            }
                        }//end for loop
    
                        if(foundPathPoints !== -1){
    
                            if(pathPoints[foundPathPoints].startNode === d.myData.startNodeID 
                            && pathPoints[foundPathPoints].startTree === d.myData.startTree && pathPoints[foundPathPoints].endTree === d.myData.endTree){
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
                                    parentX = parentX - (markerWidth*(markerMult - 1 + mult2));
                                }else{
                                    parentX = parentX + (markerWidth*(markerMult - 1+ mult2));
                                }
                                parentY = parentY + (markerWidth*(markerMult - 1 + 0.5 + mult3));
                                
                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "below";
                                pathPoints[foundPathPoints].points.push(temp);
                            }else{
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
                                    parentX = parentX - (markerWidth*(markerMult - 1 + mult2));
                                }else{
                                    parentX = parentX + (markerWidth*(markerMult - 1+ mult2));
                                }
                                parentY = parentY + (markerWidth*(markerMult - 1 + 0.5 + mult3));
                                
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
                            currentPathObj.startNode = d.myData.startNodeID;
                            currentPathObj.startTree = d.myData.startTree;
                            currentPathObj.endNode = d.myData.endNode;
                            currentPathObj.endTree = d.myData.endTree;
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
                        }
                    }else if(vert){
                        let foundPathPoints = -1;
    
                        for(let j = 0; j < pathPoints.length; j++){
                            
                            if(d.myData.endTree !== selectedTreeName){
                                if(pathPoints[j].startNode === d.myData.startNodeID && pathPoints[j].startTree === d.myData.startTree
                                    && pathPoints[j].endTree === d.myData.endTree){
                                    foundPathPoints = j;
                                    break;
                                }
                            }else{
                                if(pathPoints[j].endNode === d.myData.endNodeID && pathPoints[j].endTree === d.myData.endTree
                                && pathPoints[j].startTree === d.myData.startTree){
                                        foundPathPoints = j;
                                        break;
                                }
                            }
                        }//end for loop
    
                        if(foundPathPoints !== -1){
                            if(pathPoints[foundPathPoints].startNode === d.myData.startNodeID 
                            && pathPoints[foundPathPoints].startTree === d.myData.startTree && pathPoints[foundPathPoints].endTree === d.myData.endTree){
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
                                    parentY = parentY - (markerWidth*(markerMult - 1 + mult2));
                                }else{
                                    parentY = parentY + (markerWidth*(markerMult - 1+ mult2));
                                }
                                parentX= parentX + (markerWidth*(markerMult - 1 + 0.5 + mult3));
                                
                                let temp = {};
                                temp.startPoint = [x, y];
                                temp.control1 = [cp1[0], cp1[1]];
                                temp.control2 = [cp2[0], cp2[1]];
                                temp.endPoint = [parentX, parentY];
                                temp.subAdd = markerAddSubtract;
                                temp.belowAbove = "below";
                                pathPoints[foundPathPoints].points.push(temp); 
                            }else{
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
                                    parentY = parentY - (markerWidth*(markerMult - 1 + mult2));
                                }else{
                                    parentY = parentY + (markerWidth*(markerMult - 1+ mult2));
                                }
                                parentX = parentX + (markerWidth*(markerMult - 1 + 0.5 + mult3));
                                
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
                            currentPathObj.startNode = d.myData.startNodeID;
                            currentPathObj.startTree = d.myData.startTree;
                            currentPathObj.endNode = d.myData.endNodeID;
                            currentPathObj.endTree = d.myData.endTree;
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
                        }
                    }else if(diag){
                        let foundPathPoints = -1;
    
                        for(let j = 0; j < pathPoints.length; j++){
                            if(d.myData.endTree !== selectedTreeName){
                                if(pathPoints[j].startNode === d.myData.startNodeID && pathPoints[j].startTree === d.myData.startTree
                                    && pathPoints[j].endTree === d.myData.endTree){
                                    foundPathPoints = j;
                                    break;
                                }
    
                            }else{
                                if(pathPoints[j].endNode === d.myData.endNodeID && pathPoints[j].startTree === d.myData.startTree
                                    && pathPoints[j].endTree === d.myData.endTree){
                                    foundPathPoints = j;
                                    break;
                                }
                            }
                        }//end for loop
    
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
                            currentPathObj.startNode = d.myData.startNodeID;
                            currentPathObj.startTree = d.myData.startTree;
                            currentPathObj.endNode = d.myData.endNodeID;
                            currentPathObj.endTree = d.myData.endTree;
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
                        }
                    }//end else if
                }//end else
    
                return "M" + x + "," + y
                + "C" + cp1[0] + "," + cp1[1]
                + " " + cp2[0] + "," + cp2[1]
                + " " + parentX + "," + parentY;
            })
            .attr("stroke", function(d){
                if(d.myData.startTree === selectedTreeName){
                    //the start tree is the tree shown
                    if(d.startX < minx || d.startX > maxx || d.startY < miny || d.startY > maxy){
                        return "none"
                    }
                }else{
                    if(d.endX < minx || d.endX > maxx || d.endY < miny || d.endY > maxy){
                        return "none"
                    }
                }
    
                return "black"
            })
            .attr("dd", function(d){
                return d.myData.startNode + d.myData.endNode;
            })
            .attr('fill', 'none')
            .style("stroke-width", "1.5px")
            .attr('marker-end', function(d){
                if(d.myData.startTree === selectedTreeName){
                    //the start tree is the tree shown
                    if(d.startX < minx || d.startX > maxx || d.startY < miny || d.startY > maxy){
                        return 'url(#arrowInterEmpty)'
                    }
                }else{
                    if(d.endX < minx || d.endX > maxx || d.endY < miny || d.endY > maxy){;
                        return 'url(#arrowInterEmpty)'
                    }
                }

                return 'url(#arrowInter)'
            })
            .on("mouseover", function(event,d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'inline');
                let coords = d3.pointer( event,  d3.select('.mainArea').select("#containerSVG").node());
    
                d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'> Edge Type: </span>" + d.myData.edgeType
                + "<br/> <span class='tooltip-text-bold'>Start Node: </span> " + d.myData.startNode
                + "<br/> <span class='tooltip-text-bold'>Start Tree: </span>" + d.myData.startTree
                + "<br/> <span class='tooltip-text-bold'>End Node: </span>" + d.myData.endNode
                + "<br/> <span class='tooltip-text-bold'>End Tree: </span>" + d.myData.endTree )
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
    
                svgContainer.select("#arrows").selectAll("path").style("opacity", function(d2, i2){
                    if(d.myData.startNodeID === d2.myData.startNodeID &&
                        d.myData.startTree === d2.myData.startTree &&
                        d.myData.endNodeID === d2.myData.endNodeID &&
                        d.myData.endTree === d2.myData.endTree &&
                        d.myData.edgeType === d2.myData.edgeType ){
                            return 1;
                    }
                    return 0.1;
                })
    
                svgContainer.select("#treeIcicleSVG").selectAll("rect").attr("opacity", function(d2,i2){
                    if(d.myData.startTree === selectedTreeName && d.myData.startNodeID === d2.data.id){
                        return 1;
                    }else if(d.myData.endTree === selectedTreeName && d.myData.endNodeID === d2.data.id){
                        return 1;
                    }
                    return 0.5;
                })
                .attr("stroke", function(d2,i2){
                    if(d.myData.startTree === selectedTreeName && d.myData.startNodeID === d2.data.id){
                        return "black";
                    }else if(d.myData.endTree === selectedTreeName && d.myData.endNodeID === d2.data.id){
                        return "black";
                    }
                    return "#c6c6c6";
                })
    
                svgContainer.select("#treeIcicleSVG").selectAll("circle").style("fill", function(d2, i2){
                    if(d.myData.startTree === selectedTreeName && d.myData.startNodeID === d2.data.id){
                        return "black";
                    }else if(d.myData.endTree === selectedTreeName && d.myData.endNodeID === d2.data.id){
                        return "black";
                    }
                    return "gray";
                })
    
                svgContainer.select("#treeRing").selectAll("polygon").style("opacity", function(d2, i2){
                    if(d.myData.startTree === selectedTreeName && d3.select(this).attr("treeName") === d.myData.endTree){
                        return 1
                    }else if(d.myData.endTree === selectedTreeName && d3.select(this).attr("treeName") === d.myData.startTree){
                        return 1
                    }else if(d3.select(this).attr("treeName") === selectedTreeName){
                        return 0.1;
                    }
                    return 0.1;
                })

                if( d3.select("#treeMiniIcicleG").nodes().length !== 0){
                    let miniHierarchyTree =  d3.select("#treeMiniIcicleG").selectAll("rect").data()[0].data.name;
    
                    if(d.myData.startTree === miniHierarchyTree ){
                        d3.select("#treeMiniIcicleG").selectAll("rect")
                        .style("opacity", function(d2,i2){
                            if(d2.data.id === d.myData.startNodeID){
                                return 1
                            }
                            return 0.25;
                        })
    
                        d3.select("#treeMiniIcicleG").selectAll("circle")
                        .style("opacity", function(d2,i2){
                            if(d2.data.id === d.myData.startNodeID){
                                return 1
                            }
                            return 0.25;
                        })
                    }else if( d.myData.endTree === miniHierarchyTree){
                        d3.select("#treeMiniIcicleG").selectAll("rect")
                        .style("opacity", function(d2,i2){
                            if(d2.data.id === d.myData.endNodeID){
                                return 1
                            }
                            return 0.5;
                        })
                        d3.select("#treeMiniIcicleG").selectAll("circle")
                        .style("opacity", function(d2,i2){
                            if(d2.data.id === d.myData.endNodeID){
                                return 1
                            }
                            return 0.5;
                        })
                    }
                }
            })
            .on("mouseout", function(event,d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');
                svgContainer.select("#arrows").selectAll("path").style("opacity", 1);
                svgContainer.select("#treeIcicleSVG").selectAll("rect").attr("opacity", 1).attr("stroke", "#c6c6c6");
                svgContainer.select("#treeIcicleSVG").selectAll("circle").style("fill", "black");
                svgContainer.select("#treeRing").selectAll("polygon").style("opacity", function(d2,i2){
                    if(d3.select(this).attr("treeName") === selectedTreeName){
                        return 0.2;
                    }
                    return 1;
                });
                if( d3.select("#treeMiniIcicleG").nodes().length !== 0){
                    
                    d3.select("#treeMiniIcicleG").selectAll("rect")
                    .style("opacity", 1);
                    d3.select("#treeMiniIcicleG").selectAll("circle")
                    .style("opacity", 1);
                }
            });

            let edgesPerNode = {};
            filteredTreeInterData.forEach(function(d,i){
                if(d.myData.startTree === selectedTreeName && edgesPerNode[d.myData.startNodeID] === undefined){
                    edgesPerNode[d.myData.startNodeID] = [];
                    edgesPerNode[d.myData.startNodeID].push(d);
                }else if(d.myData.startTree === selectedTreeName ){
                    edgesPerNode[d.myData.startNodeID].push(d);
                } 
                
                if(d.myData.endTree === selectedTreeName && edgesPerNode[d.myData.endNodeID] === undefined){
                    edgesPerNode[d.myData.endNodeID] = [];
                    edgesPerNode[d.myData.endNodeID].push(d);
                }else if(d.myData.endTree === selectedTreeName){
                    edgesPerNode[d.myData.endNodeID].push(d);
                } 
    
            })

            svg.selectAll("circle")
            .on("mouseover", function(event,d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'inline');
                let coords = d3.pointer( event,  d3.select('.mainArea').select("#treeIcicleSVG").node());

                let edgesPerSelectedNode = edgesPerNode[d.data.id];
                let outgoingEdges = 0;
                let incomingEdges= 0;
                let totalEdges = 0;
                if(edgesPerSelectedNode !== undefined){
                    totalEdges = edgesPerSelectedNode.length
                    edgesPerSelectedNode.forEach(function(d2,i2){
                        if(d2.startNodeID === d.data.id && d2.startTree === selectedTreeName){
                            outgoingEdges++;
                        }else{
                            incomingEdges++;
                        }
                    })
                }

                d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'>Node Name:</span> " + d.data.name
                + "<br/> <span class='tooltip-text-bold'>Node Type:</span> " + d.data.type
                + "<br/> <span class='tooltip-text-bold'>Node ID:</span> " + d.data.id
                + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span> " + totalEdges
                + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span> " + incomingEdges
                + "<br/> <span class='tooltip-text-bold'># Outgoing Edges:</span> " + outgoingEdges)
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

                svgContainer.select("#arrows").selectAll("path").style("opacity", function(d2, i2){
                    if(d2.myData.startTree === selectedTreeName && d.data.id === d2.myData.startNodeID ){
                        return 1;
                    }else if(d2.myData.endTree === selectedTreeName &&  d.data.id === d2.myData.endNodeID){
                        return 1;
                    }

                    return 0.1;
                })
            })
            .on("mouseout", function(event,d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');
            })
        }//end if
        else if(prevProps.selectedTreeName !== this.props.selectedTreeName){
            console.log("props changed for inter dbllick", this.props.selectedTreeName);
            let myDuration = 1500;

            const divId = '#'+ this.props.id;
            d3.select(divId).select("#treeIcicleG").selectAll('rect').transition().duration(myDuration).style("opacity", 0);
            d3.select(divId).select("#arrows").selectAll('path').transition().duration(myDuration).style("opacity", 0);
            d3.select(divId).select("#treeIcicleG").selectAll('circle').transition().duration(myDuration).style("opacity", 0);
            this.drawTreeIcicleInter = this.drawTreeIcicleInter.bind(this);
            let ss = this.drawTreeIcicleInter;
            
            setTimeout(function(){
                d3.select("#containerSVG").remove();
                ss();
            }, myDuration)
        }
    }//end componentDidUpdate function

    componentWillUnmount(){
        console.log("Unmount empty TreeIcicleInter")
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
        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();

        //Redraw the direct chord diagram
        this.drawTreeIcicleInter = this.drawTreeIcicleInter.bind(this);
        this.drawTreeIcicleInter();
    }//end redrawChart function

    // Gets the tree hierarchy data given a name
    getSelectedTreeData(name, data){
        for(let i = 0; i < data.length; i++){
            if(data[i].name === name){
                return data[i];
            }
        }
        return -1;
    }//end function

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
    }//end function

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

    drawInterEdges(svgContainer, props, state, data, scaleValue){
        console.log("drawInteredges ", props, data, svgContainer)
        const selectedTreeName = props.selectedTreeName;

        let smallerRectWidth = d3.select("#treeIcicleSVG").attr("originalWidth");
        let smallerRectHeight = d3.select("#treeIcicleSVG").attr("originalHeight");

        let transform =  (d3.select("#treeIcicleG").attr("transform")).split(" ");
        let translate = (((transform[0].slice(0,-1)).split("("))[1]).split(",");
        let scale = (((transform[1].slice(0,-1)).split("("))[1]);

        let coords = [];
        let icicleX = d3.select("#treeIcicleSVG").attr("x");
        let icicleY = d3.select("#treeIcicleSVG").attr("y");

        let minx = parseFloat(d3.select("#treeIcicleSVG").attr("x"));
        let maxx = parseFloat(d3.select("#treeIcicleSVG").attr("x")) + parseFloat(smallerRectWidth);
        let miny = parseFloat(d3.select("#treeIcicleSVG").attr("y"));
        let maxy = parseFloat(d3.select("#treeIcicleSVG").attr("y")) + parseFloat(smallerRectHeight);
        
        let markerWidth = 8;
        svgContainer.selectAll("defs").remove();
        svgContainer
        .append('defs')
        .append('marker')
        .attr('id', 'arrowInter')
        .attr('viewBox', [0, -5, 10, 10])
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerWidth)
        .attr('orient', 'auto')
        .attr("markerUnits", "userSpaceOnUse")
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('stroke', 'black');

        svgContainer
        .append('defs')
        .append('marker')
        .attr('id', 'arrowInterEmpty')
        .attr('viewBox', [0, -5, 10, 10])
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('markerWidth', markerWidth)
        .attr('markerHeight', markerWidth)
        .attr('orient', 'auto')
        .attr("markerUnits", "userSpaceOnUse")
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('stroke', 'none')
        .attr("fill", "none");


        //Create data getting the x and y of each arrow
        for(let i = 0; i < data.length; i++){
            if(data[i].startTree === props.selectedTreeName){
                //Find start tree node in tree icicle
                let realX;
                let realY;
                d3.select("#treeIcicleG").selectAll("circle").nodes().forEach(function(d,i2){
                    if(d3.select(d).data()[0].data.id === data[i].startNodeID){
                            realX = parseFloat(translate[0]) + ((d3.select(d).attr("cx"))*scale) + parseFloat(icicleX)
                            realY = parseFloat(translate[1]) + ((d3.select(d).attr("cy"))*scale) +  parseFloat(icicleY)
                    }
                })

                let endRealX = null;
                let endRealY = null;

                for(let j = 0; j < d3.select("#treeRing").selectAll("polygon").nodes().length; j++){
                    if(endRealX === null){
                        if(d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("treeName") === data[i].endTree ){
                            let polygonPoints = d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("points").split(" ");
                            let polygonTransformation = d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("transform");
                            let polygoTransArr = polygonTransformation.split("(")[1].slice(0,-1).split(",");
                            let x3 = (parseFloat(polygonPoints[3].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                             - (parseFloat(polygonPoints[3].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                             + parseFloat(polygoTransArr[1]);
                             let y3 = (parseFloat(polygonPoints[3].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                             + (parseFloat(polygonPoints[3].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                             + parseFloat(polygoTransArr[2]);
                            let rotatedPolygonPoint3 = [ x3, y3];
                            let x4 = (parseFloat(polygonPoints[4].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                            - (parseFloat(polygonPoints[4].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                            + parseFloat(polygoTransArr[1]);
                            let y4 = (parseFloat(polygonPoints[4].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                            + (parseFloat(polygonPoints[4].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                            + parseFloat(polygoTransArr[2]);
                            let rotatedPolygonPoint4 = [ x4, y4];
                            let midpointEnd = [(rotatedPolygonPoint3[0] + rotatedPolygonPoint4[0])/2, (rotatedPolygonPoint3[1] + rotatedPolygonPoint4[1])/2];
                            
                            endRealX = midpointEnd[0];
                            endRealY = midpointEnd[1];
                        }//end if
                    }//end if
                }//end for loop

                let obj = {startX: realX, startY: realY, endX: endRealX, endY: endRealY, myData: data[i] };
                coords.push(obj);
            }else{
                // find start tree node
                let realX = null;
                let realY ;

                for(let j = 0; j < d3.select("#treeRing").selectAll("polygon").nodes().length; j++){
                    if(realX === null){
                        if(d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("treeName") === data[i].startTree ){
                            let polygonPoints = d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("points").split(" ");
                            let polygonTransformation = d3.select(d3.select("#treeRing").selectAll("polygon").nodes()[j]).attr("transform");
                            let polygoTransArr = polygonTransformation.split("(")[1].slice(0,-1).split(",");
                            let x3 = (parseFloat(polygonPoints[3].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                             - (parseFloat(polygonPoints[3].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                             + parseFloat(polygoTransArr[1]);
                             let y3 = (parseFloat(polygonPoints[3].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                             + (parseFloat(polygonPoints[3].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                             + parseFloat(polygoTransArr[2]);
                            let rotatedPolygonPoint3 = [ x3, y3];
                            let x4 = (parseFloat(polygonPoints[4].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                            - (parseFloat(polygonPoints[4].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                            + parseFloat(polygoTransArr[1]);
                            let y4 = (parseFloat(polygonPoints[4].split(",")[0]) - parseFloat(polygoTransArr[1])) * Math.sin(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                            + (parseFloat(polygonPoints[4].split(",")[1]) - parseFloat(polygoTransArr[2])) * Math.cos(parseFloat(polygoTransArr[0]) * (Math.PI/180))
                            + parseFloat(polygoTransArr[2]);
                            let rotatedPolygonPoint4 = [ x4, y4];
                            let midpointEnd = [(rotatedPolygonPoint3[0] + rotatedPolygonPoint4[0])/2, (rotatedPolygonPoint3[1] + rotatedPolygonPoint4[1])/2];

                            realX = midpointEnd[0];
                            realY = midpointEnd[1];
                        }//end if
                    }//end if
                }//end for loop
                let endRealX = null;
                let endRealY = null;

                d3.select("#treeIcicleG").selectAll("circle").nodes().forEach(function(d,i2){
                    if(d3.select(d).data()[0].data.id === data[i].endNodeID){
                        endRealX = parseFloat(translate[0]) + ((d3.select(d).attr("cx"))*scale) + parseFloat(icicleX)
                        endRealY = parseFloat(translate[1]) + ((d3.select(d).attr("cy"))*scale) +  parseFloat(icicleY)
                    }
                })
    
                let obj = {startX: realX, startY: realY, endX: endRealX, endY: endRealY, myData: data[i] };
                coords.push(obj);
            }//end else
        }//end for loop

        let pathPoints = [];
        //Draw lines
        svgContainer.append('g').attr("id","arrows").append('g').selectAll("path")
        .data(coords)
        .join("path")
        .attr("d", function(d){
            let currentPathObj = {};

            let x = d.startX;
            let y = d.startY;
            let parentX = d.endX;
            let parentY = d.endY;
            let markerMult = 2;

            let markerAddSubtract = "add";
            if(d.myData.endTree !== selectedTreeName){
                markerMult = 1;
                markerWidth = 8;
                //console.log("mult is 1");
            }else{
                if(scaleValue < 1){
                    markerWidth = 8 * scaleValue;
                }else{
                    markerWidth = 8 * (scaleValue - ((scaleValue-1)/2));
                }
            }

            if(y === parentY && x < parentX){
                parentX = parentX- (markerWidth*markerMult);
                markerAddSubtract = "subtract";
                 //console.log("y same x small ");
            }else if(y === parentY && x > parentX){
                parentX = parentX + (markerWidth*markerMult);
                 //console.log("y same x large ");
            }else if(x === parentX && y < parentY){
                parentY = parentY - (markerWidth*markerMult);
                markerAddSubtract = "subtract";
                // console.log("x same y small ");
            }else if(x === parentX &&  y> parentY){
                //console.log("x same y large ");
                parentY = parentY + (markerWidth*markerMult);
            }else if(x < parentX && y < parentY){
                //console.log("x small y small ");
                if(parentY - y > markerWidth*markerMult){
                    //Normal change
                    parentY = parentY - (markerWidth*markerMult);
                }else{
                   //Changing difference
                    let minDiff = parentY- y - 0.000001;
                    parentY = parentY - minDiff;
                }
                markerAddSubtract = "subtract";
            }else if(x < parentX && y > parentY){
                //console.log("x small y large ");
                if(y - parentY > (markerWidth*markerMult)){
                    parentY = parentY + (markerWidth*markerMult);
                }else{
                    let minDiff = y- parentY - 0.000001;
                    parentY = parentY + minDiff;
                }
            }else if(x > parentX && y > parentY){
                if(y - parentY > (markerWidth*markerMult)){
                    parentY = parentY + (markerWidth*markerMult);
                }else{
                    let minDiff = y- parentY - 0.000001;
                    parentY = parentY + minDiff;
                }
                 //console.log("x large y large ");
            }else if(x > parentX && y < parentY){
                if(parentY - y > markerWidth*markerMult){
                    //console.log("normal change")
                    parentY = parentY - (markerWidth*markerMult);
                }else{
                    //console.log("changeing difference")
                    let minDiff = parentY- y - 0.000001;
                    parentY = parentY - minDiff;
                }
                markerAddSubtract = "subtract";
                 //console.log("x large y small ");
            }

            let cp1 = [x, (y+parentY)/2];
            let cp2 = [parentX , (y+parentY)/2];

            if(pathPoints.length === 0){
                currentPathObj.startNode = d.myData.startNodeID;
                currentPathObj.startTree = d.myData.startTree;
                currentPathObj.endNode = d.myData.endNode;
                currentPathObj.endTree = d.myData.endTree;
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
                let horz = false;
                let vert = false;
                let diag = false;

                if(y === parentY){
                    horz = true;
                }else if(x === parentX ){
                    vert = true;
                }else{
                    diag = true;
                }//end else

                if(horz){
                    let foundPathPoints = -1;

                    for(let j = 0; j < pathPoints.length; j++){
                        if(d.myData.endTree !== selectedTreeName){
                            if(pathPoints[j].startNode === d.myData.startNode && pathPoints[j].startTree === d.myData.startTree
                                && pathPoints[j].endTree === d.myData.endTree){
                                foundPathPoints = j;
                                break;
                            }
                        }else{
                            if(pathPoints[j].endNode === d.myData.endNode && pathPoints[j].endTree === d.myData.endTree
                            && pathPoints[j].startTree === d.myData.startTree){
                                    foundPathPoints = j;
                                    break;
                            }
                        }
                    }//end for loop

                    if(foundPathPoints !== -1){

                        if(pathPoints[foundPathPoints].startNode === d.myData.startNodeID 
                        && pathPoints[foundPathPoints].startTree === d.myData.startTree && pathPoints[foundPathPoints].endTree === d.myData.endTree){
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
                                parentX = parentX - (markerWidth*(markerMult - 1 + mult2));
                            }else{
                                parentX = parentX + (markerWidth*(markerMult - 1+ mult2));
                            }
                            parentY = parentY + (markerWidth*(markerMult - 1 + 0.5 + mult3));
                            
                            let temp = {};
                            temp.startPoint = [x, y];
                            temp.control1 = [cp1[0], cp1[1]];
                            temp.control2 = [cp2[0], cp2[1]];
                            temp.endPoint = [parentX, parentY];
                            temp.subAdd = markerAddSubtract;
                            temp.belowAbove = "below";
                            pathPoints[foundPathPoints].points.push(temp);
                        }else{
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
                                parentX = parentX - (markerWidth*(markerMult - 1 + mult2));
                            }else{
                                parentX = parentX + (markerWidth*(markerMult - 1+ mult2));
                            }
                            parentY = parentY + (markerWidth*(markerMult - 1 + 0.5 + mult3));
                            
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
                        currentPathObj.startNode = d.myData.startNodeID;
                        currentPathObj.startTree = d.myData.startTree;
                        currentPathObj.endNode = d.myData.endNodeID;
                        currentPathObj.endTree = d.myData.endTree;
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
                    }


                }else if(vert){
                    let foundPathPoints = -1;

                    for(let j = 0; j < pathPoints.length; j++){
                        
                        if(d.myData.endTree !== selectedTreeName){
                            if(pathPoints[j].startNode === d.myData.startNodeID && pathPoints[j].startTree === d.myData.startTree
                                && pathPoints[j].endTree === d.myData.endTree){
                                foundPathPoints = j;
                                break;
                            }
                        }else{
                            if(pathPoints[j].endNode === d.myData.endNodeID && pathPoints[j].endTree === d.myData.endTree
                            && pathPoints[j].startTree === d.myData.startTree){
                                    foundPathPoints = j;
                                    break;
                            }
                        }
                    }//end for loop

                    if(foundPathPoints !== -1){
                        if(pathPoints[foundPathPoints].startNode === d.myData.startNodeID 
                        && pathPoints[foundPathPoints].startTree === d.myData.startTree && pathPoints[foundPathPoints].endTree === d.myData.endTree){
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
                                parentY = parentY - (markerWidth*(markerMult - 1 + mult2));
                            }else{
                                parentY = parentY + (markerWidth*(markerMult - 1+ mult2));
                            }
                            parentX= parentX + (markerWidth*(markerMult - 1 + 0.5 + mult3));
                            
                            let temp = {};
                            temp.startPoint = [x, y];
                            temp.control1 = [cp1[0], cp1[1]];
                            temp.control2 = [cp2[0], cp2[1]];
                            temp.endPoint = [parentX, parentY];
                            temp.subAdd = markerAddSubtract;
                            temp.belowAbove = "below";
                            pathPoints[foundPathPoints].points.push(temp);
                                
                        }else{
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
                                parentY = parentY - (markerWidth*(markerMult - 1 + mult2));
                            }else{
                                parentY = parentY + (markerWidth*(markerMult - 1+ mult2));
                            }
                            parentX = parentX + (markerWidth*(markerMult - 1 + 0.5 + mult3));
                            
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
                        currentPathObj.startNode = d.myData.startNodeID;
                        currentPathObj.startTree = d.myData.startTree;
                        currentPathObj.endNode = d.myData.endNodeID;
                        currentPathObj.endTree = d.myData.endTree;
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
                    }
                    
                }else if(diag){
                    //console.log("is diag")

                    let foundPathPoints = -1;

                    for(let j = 0; j < pathPoints.length; j++){
                        if(d.myData.endTree !== selectedTreeName){
                            if(pathPoints[j].startNode === d.myData.startNodeID && pathPoints[j].startTree === d.myData.startTree
                                && pathPoints[j].endTree === d.myData.endTree){
                                foundPathPoints = j;
                                break;
                            }

                        }else{
                            if(pathPoints[j].endNode === d.myData.endNodeID && pathPoints[j].startTree === d.myData.startTree
                                && pathPoints[j].endTree === d.myData.endTree){
                                foundPathPoints = j;
                                break;
                            }
                        }
                    }//end for loop

                    if(foundPathPoints !== -1){
                        //console.log("found point already exists");
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
                            //console.log("IN CASE 0 NUMBER");
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
                            //console.log("IN CASE 1 NUMBER");
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
                            //console.log("IN CASE 2 NUMBER");
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
                            //console.log("IN CASE 3 NUMBER");
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
                        //console.log("path doesnt exist yet")
                        currentPathObj.startNode = d.myData.startNodeID;
                        currentPathObj.startTree = d.myData.startTree;
                        currentPathObj.endNode = d.myData.endNodeID;
                        currentPathObj.endTree = d.myData.endTree;
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
                    }
                }//end else if
            }//end else

            return "M" + x + "," + y
            + "C" + cp1[0] + "," + cp1[1]
            + " " + cp2[0] + "," + cp2[1]
            + " " + parentX + "," + parentY;
        })
        .attr("stroke", function(d){
            if(d.myData.startTree === props.selectedTreeName){
                //the start tree is the tree shown
                if(d.startX < minx || d.startX > maxx || d.startY < miny || d.startY > maxy){
                    return "none"
                }
            }else{
                if(d.endX < minx || d.endX > maxx || d.endY < miny || d.endY > maxy){
                    return "none"
                }
            }

            return "black"
        })
        .style("stroke-width", "1.5px")
        .attr("dd", function(d){
            return d.myData.startNode + d.myData.endNode;
        })
        .attr('fill', 'none')
        .attr('marker-end', function(d){
            if(d.myData.startTree === props.selectedTreeName){
                //the start tree is the tree shown
                if(d.startX < minx || d.startX > maxx || d.startY < miny || d.startY > maxy){
                    return 'url(#arrowInterEmpty)'
                }
            }else{
                if(d.endX < minx || d.endX > maxx || d.endY < miny || d.endY > maxy){
                    return 'url(#arrowInterEmpty)'
                }
            }
            return 'url(#arrowInter)'
        })
        .on("mouseover", function(event,d){
            d3.select('.mainArea').select("#tooltip3").style('display', 'inline');
            let coords = d3.pointer( event,  d3.select('.mainArea').select("#containerSVG").node());

            d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'> Edge Type: </span> " + d.myData.edgeType
                + "<br/> <span class='tooltip-text-bold'> Start Node: </span>" + d.myData.startNode
                + "<br/> <span class='tooltip-text-bold'> Start Tree: </span> " + d.myData.startTree
                + "<br/> <span class='tooltip-text-bold'> End Node: </span>" + d.myData.endNode
                + "<br/> <span class='tooltip-text-bold'> End Tree: </span>" + d.myData.endTree )
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

            //Highlight current edge
            svgContainer.select("#arrows").selectAll("path").style("opacity", function(d2, i2){
                if(d.myData.startNodeID === d2.myData.startNodeID &&
                    d.myData.startTree === d2.myData.startTree &&
                    d.myData.endNodeID === d2.myData.endNodeID &&
                    d.myData.endTree === d2.myData.endTree &&
                    d.myData.edgeType === d2.myData.edgeType ){
                        return 1;
                }
                return 0.1;
            })

            //Highlight only rectangles that are associated with the edge
            svgContainer.select("#treeIcicleSVG").selectAll("rect").attr("opacity", function(d2,i2){
                if(d.myData.startTree === selectedTreeName && d.myData.startNodeID === d2.data.id){
                    return 1;
                }else if(d.myData.endTree === selectedTreeName && d.myData.endNodeID === d2.data.id){
                    return 1;
                }
                return 0.5;
            })
            .attr("stroke", function(d2,i2){
                if(d.myData.startTree === selectedTreeName && d.myData.startNodeID === d2.data.id){
                    return "black";
                }else if(d.myData.endTree === selectedTreeName && d.myData.endNodeID === d2.data.id){
                    return "black";
                }
                return "#c6c6c6";
            })

            //Highlight only circle that is associated with the edge
            svgContainer.select("#treeIcicleSVG").selectAll("circle").style("fill", function(d2, i2){
                if(d.myData.startTree === selectedTreeName && d.myData.startNodeID === d2.data.id){
                    return "black";
                }else if(d.myData.endTree === selectedTreeName && d.myData.endNodeID === d2.data.id){
                    return "black";
                }
                return "gray";
            })

            svgContainer.select("#treeRing").selectAll("polygon").style("opacity", function(d2, i2){
                if(d.myData.startTree === selectedTreeName && d3.select(this).attr("treeName") === d.myData.endTree){
                    return 1
                }else if(d.myData.endTree === selectedTreeName && d3.select(this).attr("treeName") === d.myData.startTree){
                    return 1
                }else if(d3.select(this).attr("treeName") === selectedTreeName){
                    return 0.1;
                }

                return 0.1;
            })

            if( d3.select("#treeMiniIcicleG").nodes().length !== 0){
                let miniHierarchyTree =  d3.select("#treeMiniIcicleG").selectAll("rect").data()[0].data.name;

                if(d.myData.startTree === miniHierarchyTree ){
                    d3.select("#treeMiniIcicleG").selectAll("rect")
                    .style("opacity", function(d2,i2){
                        if(d2.data.id === d.myData.startNodeID){
                            return 1
                        }
                        return 0.25;
                    })

                    d3.select("#treeMiniIcicleG").selectAll("circle")
                    .style("opacity", function(d2,i2){
                        if(d2.data.id === d.myData.startNodeID){
                            return 1
                        }
                        return 0.25;
                    })
                }else if( d.myData.endTree === miniHierarchyTree){
                    d3.select("#treeMiniIcicleG").selectAll("rect")
                    .style("opacity", function(d2,i2){
                        if(d2.data.id === d.myData.endNodeID){
                            return 1
                        }
                        return 0.5;
                    })
                    d3.select("#treeMiniIcicleG").selectAll("circle")
                    .style("opacity", function(d2,i2){
                        if(d2.data.id === d.myData.endNodeID){
                            return 1
                        }
                        return 0.5;
                    })
                }
            }
        })
        .on("mouseout", function(event,d){
            d3.select('.mainArea').select("#tooltip3").style('display', 'none');
            svgContainer.select("#arrows").selectAll("path").style("opacity", 1);
            svgContainer.select("#treeIcicleSVG").selectAll("rect").attr("opacity", 1).attr("stroke", "#c6c6c6");
            svgContainer.select("#treeIcicleSVG").selectAll("circle").style("fill", "black");
            svgContainer.select("#treeRing").selectAll("polygon").style("opacity", function(d2,i2){
                if(d3.select(this).attr("treeName") === selectedTreeName){
                    return 0.2;
                }
                return 1;
            });
            if( d3.select("#treeMiniIcicleG").nodes().length !== 0){
                d3.select("#treeMiniIcicleG").selectAll("rect")
                .style("opacity", 1);
                d3.select("#treeMiniIcicleG").selectAll("circle")
                .style("opacity", 1);
            }
        });

    }//end drawing inter edges

    drawTreeIcicleInter(){
        console.log("In TreeIcicleInter with  tree ", this.props.selectedTreeName,
        " and other props ", this.props);

        const divId = '#'+ this.props.id;
        let height = this.state.height ;
        const stateWidth = this.state.width;

        //Set height of div
        d3.select(divId).style("height",  d3.select(".mainArea").style("height")).attr("class", "overDivs");

        const divSmall = 1.5;
        let width = this.state.width / divSmall;
        let originalWidth = this.state.width / divSmall;
        let originalHeight = this.state.height /divSmall;
        let drawingArrows = this.drawInterEdges;
        let getData = this.getSelectedTreeInterData;
        let dataInter = this.getSelectedTreeInterData(this.props.treesInterData, this.props.selectedTreeName);
        let props1 = this.props;
        let state1 = this.state;
        d3.select('.mainArea').select("#tooltip3").style('display', 'none');


        function zoomed({transform}) {
            svg.attr("transform", transform);
            //make arrow dissappear
            containerSVG.select("#arrows").remove();
        }
        function zoomedEnd(){
            //Here rerender the arrowsdr
            let scaleString = parseFloat(((svg.attr("transform").split(" ")[1]).split("(")[1]).slice(0, -1));
            drawingArrows(containerSVG, props1, state1, dataInter, scaleString);
        }
        let zoomTotal = d3.zoom()
                .scaleExtent([1/4, 100])
                .on("zoom", zoomed)
                .on("end", zoomedEnd);
                
        var transformXSvg = this.state.width/2 - (originalWidth/2);
        var transformYSVG = this.state.height/2 - (originalHeight/2);
        let containerSVG = d3.select(divId).append('svg').attr("id","containerSVG").attr("width", stateWidth).attr("height", height)

        //TODO get tree inter data from many 
        let treeInterData = getData(this.props.treesInterData, this.props.selectedTreeName);

        const svg = containerSVG.append('svg').attr("id", "treeIcicleSVG").attr("width", width).attr("height", height/divSmall)
            .attr("originalWidth", width)
            .attr("originalHeight", height/divSmall)
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

        let edgesPerNode = {};
        treeInterData.forEach(function(d,i){

            if(d.startTree === selectedTreeName && edgesPerNode[d.startNodeID] === undefined){
                edgesPerNode[d.startNodeID] = [];
                edgesPerNode[d.startNodeID].push(d);
            }else if(d.startTree === selectedTreeName ){
                edgesPerNode[d.startNodeID].push(d);
            } 
            
            if(d.endTree === selectedTreeName && edgesPerNode[d.endNodeID] === undefined){
                edgesPerNode[d.endNodeID] = [];
                edgesPerNode[d.endNodeID].push(d);
            }else if(d.endTree === selectedTreeName){
                edgesPerNode[d.endNodeID].push(d);
            } 

        })

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
        }

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

                containerSVG.select("#arrows").selectAll("path").style("opacity", function(d2, i2){

                    if(d2.myData.startTree === selectedTreeName && d.data.id === d2.myData.startNodeID ){
                        return 1;
                    }else if(d2.myData.endTree === selectedTreeName &&  d.data.id === d2.myData.endNodeID){
                        return 1;
                    }

                    return 0.1;
                })
            })
            .on("mouseout", function(event, d){
                svg.selectAll("circle").style("fill", "black")
                svg.selectAll("rect").attr("opacity", 1).attr("stroke", "#c6c6c6");
                containerSVG.select("#arrows").selectAll("path").style("opacity", function(d2,i2){
                    return 1;
                });
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

                let edgesPerSelectedNode = edgesPerNode[d.data.id];
                let outgoingEdges = 0;
                let incomingEdges= 0;
                let totalEdges = 0;
                if(edgesPerSelectedNode !== undefined){
                    totalEdges = edgesPerSelectedNode.length
                    edgesPerSelectedNode.forEach(function(d2,i2){
                        if(d2.startNodeID === d.data.id && d2.startTree === selectedTreeName){
                            outgoingEdges++;
                        }else{
                            incomingEdges++;
                        }
                    })
                }

                d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'>Node Name:</span> " + d.data.name
                + "<br/> <span class='tooltip-text-bold'>Node Type:</span> " + d.data.type
                + "<br/> <span class='tooltip-text-bold'>Node ID:</span> " + d.data.id
                + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span> " + totalEdges
                + "<br/> <span class='tooltip-text-bold'># Incoming Edges:</span> " + incomingEdges
                + "<br/> <span class='tooltip-text-bold'># Outgoing Edges:</span> " + outgoingEdges)
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

                containerSVG.select("#arrows").selectAll("path").style("opacity", function(d2, i2){
                    if(d2.myData.startTree === selectedTreeName && d.data.id === d2.myData.startNodeID ){
                        return 1;
                    }else if(d2.myData.endTree === selectedTreeName &&  d.data.id === d2.myData.endNodeID){
                        return 1;
                    }

                    return 0.1;
                })

            })
            .on("mouseout", function(event,d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');
            })

        // this.drawRing(containerSVG, this.props.handleMiniIcicleChange, 
        //     this.props.handleRingDblClickChange,
        //     this.props.selectedTreeName,
        //     this.props.treesInterData,
        //     this.props.treeIntraData,
        //     this.props.treeData,
        //     this.props.selectedMiniIcicleTreeName,
        //     this.props.networkData
        //     );
    

        var bounds2 = svg.node().getBBox();
        var fullWidth = originalWidth,
            fullHeight =  originalHeight;
        var width2 = bounds2.width,
            height2 = bounds2.height;

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
        d3.select(divId).select("#treeIcicleSVG").call(zoomTotal.transform,
            d3.zoomIdentity.translate(translate1[0], translate1[1]).scale(scale1));


        let scaleString = parseFloat(((svg.attr("transform").split(" ")[1]).split("(")[1]).slice(0, -1));


        this.drawRing(containerSVG, this.props.handleMiniIcicleChange, 
            this.props.handleRingDblClickChange,
            this.props.selectedTreeName,
            this.props.treesInterData,
            this.props.treeIntraData,
            this.props.treeData,
            this.props.selectedMiniIcicleTreeName,
            this.props.networkData
            );
        this.drawInterEdges(containerSVG, this.props, this.state, dataInter, scaleString);

        d3.select(divId).style("height", 5 + 'px');
        d3.select("#treeIcicle").raise();
        d3.select("#helpIconDiv").raise();
        d3.select("#tooltip").raise();
        d3.select("#tooltip3").raise();


    }//end drawEmptyMiniChordDiagram function

    drawRing(svgContainer, func, dblFunc, selectedTreeName, treesInterData, treesIntraData, treeData, selectedMiniIcicleTreeName, networkData){
        console.log("in draw ring function");
        const treeNames = networkData[0];

        let biggerRectHeight = d3.select('.mainArea').node().getBoundingClientRect().height;
        let biggerRectWidth = d3.select('.mainArea').node().getBoundingClientRect().width;
        let smallerRect = d3.select("#treeIcicleSVG").node().getBoundingClientRect();

        console.log("ringr node ", d3.select("#treeIcicleSVG").node())
        console.log("ringr biggerRectHeight", biggerRectHeight, " smallerRect.height" ,smallerRect.height);

        let quadrant1Transition = (biggerRectWidth/2)/((smallerRect.height / 2) + ((biggerRectHeight - smallerRect.height)/2));
        let quadrant1TransitionDegree = (Math.atan(quadrant1Transition))*(180/Math.PI)
        let quadrant2Transition = (-biggerRectHeight/2)/((smallerRect.width /2) + ((biggerRectWidth-smallerRect.width)/2))
        let quadrant2TransitionDegree = (((Math.atan(quadrant2Transition))*(180/Math.PI))* -1) + 90;
        let quadrant3Transition = (-biggerRectWidth/2)/((smallerRect.height /2) + ((biggerRectHeight-smallerRect.height)/2));
        let quadrant3TransitionDegree = (((Math.atan(quadrant3Transition))*(180/Math.PI))* -1) + 180;
        let quadrant4Transition = (-biggerRectHeight/2)/((smallerRect.width /2) + ((biggerRectWidth-smallerRect.width)/2));
        let quadrant4TransitionDegree = (((Math.atan(quadrant4Transition))*(180/Math.PI))* -1) + 270;;

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
            console.log(" ringr inter ", d)
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
                        return "DimGray";
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
                console.log("hovered over ring inter ", d.name)
                if(d.name === selectedTreeName){
                    d3.select(this).style("cursor", "default"); 
                }else{
                    d3.select(this).style("cursor", "pointer"); 
                    d3.select('.mainArea').select("#tooltip3").style('display', 'inline');
                    let coords = d3.pointer( event,  d3.select('.mainArea').select("#containerSVG").node());

                    //Get Inter data
                    const currentTreeInterData = getInterDataFunc(treesInterData, d.name);
                    let numberInterEdges = currentTreeInterData.length;

                    //Get INtra Data
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
                    + "<br/> # Intra Edges: " + numberIntraEdges )
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

                    //Show only edges associated with that tree
                    d3.select("#containerSVG").select("#arrows").selectAll("path")
                    .style("opacity", function(d4, i4){
                        if(d4.myData.startTree === d.name || d4.myData.endTree === d.name){
                            return 1;
                        }
                        return 0.1;
                    })
                }
            })
            .on("mouseout", function(event, d2){
                d3.select(this).style("cursor", "default"); 
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');
                d3.select("#containerSVG").select("#arrows").selectAll("path")
                .style("opacity", function(d4, i4){
                    return 1;
                })
            })
            .on("click", function(event, d2){
                console.log(" inter ring clicked on ", d.name);
                if(d.name !== selectedTreeName){
                    func(true, d.name)

                    d3.select("#treeRing").selectAll("polygon").style("fill", function(d4, i4){
                        let currentTreeName = d3.select(d3.select(this).node()).attr("treeName");
                        if(currentTreeName === d.name){
                            return "DimGray"
                        }
                        return "lightgray";
                    })
                }
            })
            .on("dblclick", function(event,d2 ){
                console.log("inter ring dble clicked on ", d.name);
                if(d.name !== selectedTreeName){
                    dblFunc(d.name);
                    func(false, null);
                }
            })
        })
    }//end draw ring

    render(){
        console.log("Rendering for TreeIcicleInter")
      
        return (
            <>
                <div id={this.props.id} ref={this.chartRef} ></div>
            </>
        )
    }//end render
}//end class

export default TreeIcicleInter;