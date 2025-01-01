import React from 'react';
import * as d3 from "d3";

class TreeIcicleHierarchical extends React.Component{
    constructor(props){
        super(props);
        console.log("In consructor of TreeIcicleHierarchical");
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In componenet did mount for TreeIcicleHierarchical");

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawTreeIcicleHierarchical();
        })

        d3.select('.mainArea').append('div')
        .attr("class", "myTooltip")
        .attr("id", "tooltip3")

        window.addEventListener("resize", this.redrawChart);
    }//end componenrDidMount function

    componentDidUpdate(prevProps, prevState){
        console.log(" in component did update treeiciclehierarchical ", prevProps);
        if(prevProps.selectedTreeName !== this.props.selectedTreeName){
            console.log("changing treeiciclehierarchy from ", prevProps.selectedTreeName, " to ", this.props.selectedTreeName);
            let myDuration = 1500;
            const divId = '#'+ this.props.id;
            d3.select(divId).select("#treeIcicleG").selectAll('rect').transition().duration(myDuration).style("opacity", 0);
            d3.select(divId).select("#treeIcicleG").selectAll('path').transition().duration(myDuration).style("opacity", 0);
            d3.select(divId).select("#treeIcicleG").selectAll('circle').transition().duration(myDuration).style("opacity", 0);
            this.drawTreeIcicleHierarchical = this.drawTreeIcicleHierarchical.bind(this);
            let drawFunc = this.drawTreeIcicleHierarchical;
            
            setTimeout(function(){
                d3.select("#containerSVG").remove();
                drawFunc();
            }, myDuration)
        }//end if
    }//end componentDidUpdate function

    componentWillUnmount(){
        console.log("Unmount empty TreeIcicleHierarchical")
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
        console.log("redraw TreeIcicleHierarchical")
        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();

        //Redraw the direct chord diagram
        this.drawTreeIcicleHierarchical = this.drawTreeIcicleHierarchical.bind(this);
        this.drawTreeIcicleHierarchical();
    }//end redrawChart function

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
    }//end getSelectedTreeInterData function

    ///Draws a ring of arrows around the icicle
    drawRing(svgContainer, func, dblFunc, selectedTreeName, treesInterData, treesIntraData, treeData, selectedMiniIcicleTreeName, networkData){
        console.log("in draw ring for hierarchy function");
        const treeNames = networkData[0];

        let biggerRectHeight = d3.select('.mainArea').node().getBoundingClientRect().height;
        let biggerRectWidth = d3.select('.mainArea').node().getBoundingClientRect().width;
        let smallerRect = d3.select("#treeIcicleSVG").node().getBoundingClientRect();

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
                let b = smallerRect.height / 2;
                let a =  (Math.tan(degreeIt * Math.PI / 180)) * b;
                let slope = a/b;
                let c = b + ((biggerRectHeight - smallerRect.height)/2);
                let y = c* slope;

                let x1 = biggerRectWidth/2 - y;
                let y1 = 0;
                let x2 = biggerRectWidth/2 - a;
                let y2 = (biggerRectHeight - smallerRect.height)/2;

                let midpointX = (x1 + x2)/ 2;
                let midpointY = (y1 + y2)/ 2;
                let obj1 = {x: midpointX, y:midpointY, name: treeNames[index], degree:  d3.select(d).select("path").attr("degreeMidpoint")};
                ringCoordinates.push(obj1); 
            }else if(degreeIt > quadrant1TransitionDegree && degreeIt <= quadrant2TransitionDegree){
                //IN Quadrant 2 left part

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

        //TODO: Change max length if there are many arrows need to be smaller than 0.60
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

                    // FIll the tooltip with content
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
    
                }
            })
            .on("mouseout", function(event, d2){
                d3.select(this).style("cursor", "default"); 
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');
            })
            .on("click", function(event, d2){
                console.log("ring clicked on ", d.name);
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
                console.log("ring dble clicked on ", d.name);
                if(d.name !== selectedTreeName){
                    dblFunc(d.name);
                    func(false, null);
                }
            })
        })

        

        // function cancelableClick() {
        //     console.log(" in cancelableClick ");
        //     // euclidean distance
        //     const dist = (a, b) => {
        //         return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
        //     }

        //         // Method is assumed to be a standard D3 getter-setter:
        //         // If passed with no arguments, gets the value.
        //         // If passed with arguments, sets the value and returns the target.
        //     const rebindMethod = (target, source, method) => {
        //         return (...args) => {
        //         const value = method.apply(source, args);
        //         return value === source ? target : value;
        //         };
        //     }

        //         // Copies a variable number of methods from source to target.
        //     const rebind = (target, source, ...methods) => {
        //         for (let method of methods) {
        //         target[method] = rebindMethod(target, source, source[method]);
        //         }
        //         return target;
        //     }

        //     // see: http://bl.ocks.org/ropeladder/83915942ac42f17c087a82001418f2ee
        //     //      based on: http://bl.ocks.org/couchand/6394506
        //     return({ tolerance = 5, timeout = 200} = {}) => {
        //         const dispatcher = d3.dispatch('click', 'dblclick');

        //         const cc = (selection) => {
        //         let downPt;
        //         let lastTs;
        //         let waitId;
        //         let eventArgs;

        //         selection.on('mousedown', (event, ...args) => {
        //             downPt = d3.pointer(event, document.body);
        //             lastTs = Date.now();
        //             eventArgs = [event, ...args];
        //         });

        //         selection.on('click', (e) => {
        //             if (dist(downPt, d3.pointer(e, document.body)) >= tolerance) {
        //             return;
        //             }

        //             if (waitId) {
        //             window.clearTimeout(waitId);
        //             waitId = null;
        //             dispatcher.apply("dblclick", selection, eventArgs);
        //             } else {
        //             waitId = window.setTimeout(
        //                 () => {
        //                 dispatcher.apply("click", selection, eventArgs);
        //                 waitId = null;
        //                 },
        //                 timeout
        //             );
        //             }
        //         });
        //         };

        //         return rebind(cc, dispatcher, 'on');
        //     }
        // }
        // const cc = cancelableClick({
        //     // max euclidean distance of mouse down (x,y) to mouse up (x,y) to count as one "click"
        //     tolerance: 10,
        //     // max duration of a double-click. All single clicks will have to wait this long.
        //     timeout: 300, 
        // });

        // ring.append('g').selectAll("circle")
        // .data(ringCoordinates)
        // .enter().append("circle")
        // .attr("r", 10)
        // .attr("cx", function(d) { 
        //     return  d.x; 
        // } )
        // .attr("cy",  function(d) { 
        //     return  d.y; 
        // })
        // .style("fill", "black")
        // .on("mouseover", function(event, d){
        //     console.log("hovered over ", d.name)
        //     d3.select(this).style("cursor", "pointer"); 
        // })
        // .on("mouseout", function(event, d){
        //     d3.select(this).style("cursor", "default"); 
        // })
        // // .on("click", () => console.log("single click!"))
        // // .on("dblclick", () => console.log("double click!"));
        // .on("click", function(event, d){
        //     console.log("clicked on ", d.name, " and func ", func);
        //     func(true, d.name)
        // })
        // .on("dblclick", function(event,d ){
        //     console.log("dble clicked on ", d.name, " and func ", dblFunc);
        //     dblFunc(d.name);
        //     func(false, null);
        // })

        // cc.on("click", () => console.log("single click!"));
        // cc.on("dblclick", () => console.log("double click!"));
        // ring.selectAll("circle").call(cc);
        // ring.selectAll("circle").on("click", () => console.log("single click!"));
        // ring.selectAll("circle").on("dblclick", () => console.log("double click!"));  
    }//end drawRing function


    drawTreeIcicleHierarchical(){
        console.log("In drawTreeIcicleHierarchical with tree ", this.props.selectedTreeName,
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
                
        var transformXSvg = this.state.width/2 - (originalWidth/2);
        var transformYSVG = this.state.height/2 - (originalHeight/2);
        let containerSVG = d3.select(divId).append('svg').attr("id","containerSVG").attr("width", stateWidth).attr("height", height)

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
        }//end whi.e

        let transformIdentity = d3.zoomIdentity.translate(transformXSvg, transformYSVG)
        d3.select(divId).select("#treeIcicleSVG").call(zoomTotal.transform, transformIdentity )
        const nodeTypes = this.props.uniqueNodeTypesAllTrees;
        const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#ffffb3'];
        const color = d3.scaleOrdinal( )
        .domain(nodeTypes)
        .range(colorSet);

        d3.select('.mainArea').select("#tooltip3").style('display', 'none');

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

        //Links of node/link tree
        svg.append('g').selectAll("path")
            .data(rootNode.descendants().slice(1))
            .enter()
            .append('path')
            .attr("d", function(d){
                let x = (d.x0 + d.x1 )/ 2;
                let y = ( d.y1 + d.y0 )/ 2;
                let parentX = (d.parent.x0 + d.parent.x1 )/ 2;
                let parentY = (d.parent.y0 + d.parent.y1 )/ 2;
                return "M" + x + "," + y
                + "C" + x + "," + (y + parentY)/2
                + " " + parentX + "," + (y + parentY)/2
                + " " + parentX + "," + parentY;
            })
            .attr("stroke", "black")
            .style("stroke-width", "1.5px")
            .attr("fill", "none")

        
        const currentTreeInterData = this.getSelectedTreeInterData(this.props.treesInterData, this.props.selectedTreeName);
        const currentTreeIntraData = this.getSelectedTreeIntraData(this.props.treeIntraData, this.props.selectedTreeName);

        // Node circle
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

                //Get number of intra edges for the current node
                let numberIntraEdges = 0;
                currentTreeIntraData.forEach(function(d2, i2){
                    if(d2.startNodeID === d.data.id || d2.endNodeID === d.data.id){
                        numberIntraEdges++;
                    }
                })

                //Get number of inter edges for the current node
                let numberInterEdges = 0;
                currentTreeInterData.forEach(function(d2, i2){
                    if(d2.startTree === selectedTreeName){
                        if(d2.startNodeID === d.data.id){
                            numberInterEdges++;
                        }
                    }else if(d2.endTree === selectedTreeName){
                        if(d2.endNodeID === d.data.id){
                            numberInterEdges++;
                        }
                    }
                })
        
                d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'> Node:</span> " + d.data.name
                    + "<br/> <span class='tooltip-text-bold'> Node Type:</span> " + d.data.type
                    + "<br/> <span class='tooltip-text-bold'> # Intra Edges:</span> "  + numberIntraEdges
                    + "<br/> <span class='tooltip-text-bold'># Inter Edges:</span> " + numberInterEdges)
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

                //Highlight current rectangle and circle
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
            })
            .on("mouseout", function(evennt, d){
                d3.select('.mainArea').select("#tooltip3").style('display', 'none');
                svg.selectAll("circle").style("fill", "black")
                svg.selectAll("rect").attr("opacity", 1).attr("stroke", "#c6c6c6");
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

        this.drawRing(containerSVG, this.props.handleMiniIcicleChange, 
            this.props.handleRingDblClickChange,
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
        console.log("Rendering for TreeIcicleHierarchical")
      
        return <div id={this.props.id} ref={this.chartRef} ></div>
    }//end render
}//end class

export default TreeIcicleHierarchical;