import React from 'react';
import * as d3 from "d3";

class TreeRing extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of Tree Ring");
        this.redrawChart= this.redrawChart.bind(this);

        //this.state = {isChordDiagram: true, selectedTreeName: null};
        //isChordDiagram -> determines if main area renders chord diagram or tree/icicle
        //selectedTreeName -> name of tree selected from large chord diagram
        //this.handleChange = this.handleChange.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In componenet did mount for Tree Ring");

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawTreeRing();
        })

        window.addEventListener("resize", this.redrawChart);
    }//end componentDidMount function

    //Handles change when an arc is seleted in Chord Diagram
    handleChange(newValue, selectedTreeName){
        console.log("in handleChange Tree Ring with value ", newValue);
        //this.setState({isChordDiagram: newValue, selectedTreeName: selectedTreeName });
        this.props.handleMiniChordChange(!newValue, selectedTreeName)
    }//end handleChange function

    componentWillUnmount(){
        console.log("Unmount empty TreeRing")
        window.removeEventListener("resize", this.redrawChart);
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
        this.drawTreeRing = this.drawTreeRing.bind(this);
        this.drawTreeRing();
    }

    drawTreeRing(){
        console.log("In drawTreeRing with", this.props );

        //TODO: Acces all tree names
        const treeNames = ["tree name 1", "tree name 2", "tree name 3", "tree name 4", "Tree name 5", "tree anme 6", "tree name 7", "tree name 8", "tree name 9"];
        const divId = '#'+ this.props.id;
        const stateHeight = this.state.height ;
        const stateWidth = this.state.width;
        const numberTrees = this.props.data.length;
        
        let biggerRectHeight = d3.select('.mainArea').node().getBoundingClientRect().height;
        let biggerRectWidth = d3.select('.mainArea').node().getBoundingClientRect().width;
        let smallerRect = d3.select("#treeIcicle").select("svg").node().getBoundingClientRect();

        let quadrant1Transition = (biggerRectWidth/2)/((smallerRect.height / 2) + ((biggerRectHeight - smallerRect.height)/2));
        let quadrant1TransitionDegree = (Math.atan(quadrant1Transition))*(180/Math.PI)

        let quadrant2Transition = (-biggerRectHeight/2)/((smallerRect.width /2) + ((biggerRectWidth-smallerRect.width)/2))
        let quadrant2TransitionDegree = (((Math.atan(quadrant2Transition))*(180/Math.PI))* -1) + 90;

        let quadrant3Transition = (-biggerRectWidth/2)/((smallerRect.height /2) + ((biggerRectHeight-smallerRect.height)/2));
        let quadrant3TransitionDegree = (((Math.atan(quadrant3Transition))*(180/Math.PI))* -1) + 180;

        let quadrant4Transition = (-biggerRectHeight/2)/((smallerRect.width /2) + ((biggerRectWidth-smallerRect.width)/2));
        let quadrant4TransitionDegree = (((Math.atan(quadrant4Transition))*(180/Math.PI))* -1) + 270;

        console.log("quadrant1TransitionDegree ", quadrant1TransitionDegree);
        console.log("quadrant2TransitionDegree ", quadrant2TransitionDegree);
        console.log("quadrant3TransitionDegree ", quadrant3TransitionDegree);
        console.log("quadrant4TransitionDegree ", quadrant4TransitionDegree);

        let ringCoordinates = [];
        let index = 0;

        //Set the ring same as real minin chord diagram
        d3.select("#realMiniChordDiagramDiv").select("#treeArcs").selectAll("g").nodes().forEach(function(d,i){
            console.log("d ", d3.select(d).select("path").attr("degreeMidpoint"));
            let degreeIt = Math.abs(d3.select(d).select("path").attr("degreeMidpoint") - 360);

            console.log("degreeIt ", degreeIt);

            //in Quadrant1 top part
            if(degreeIt <= quadrant1TransitionDegree || degreeIt > quadrant4TransitionDegree ){
                console.log("in quadrant 1");
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
                let obj1 = {x: midpointX, y:midpointY, name: treeNames[index]};
                ringCoordinates.push(obj1);
                
            }else if(degreeIt > quadrant1TransitionDegree && degreeIt <= quadrant2TransitionDegree){
                //IN Quadrant 2 left part
                console.log("in quadrant 2");

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
                let obj1 = {x: midpointX, y:midpointY, name: treeNames[index]};
                ringCoordinates.push(obj1);
            }else if(degreeIt > quadrant2TransitionDegree && degreeIt <= quadrant3TransitionDegree){
                //IN Quadrant 3 bottom part
                console.log("in quadrant 3");

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
                let obj1 = {x: midpointX, y:midpointY, name: treeNames[index]};
                ringCoordinates.push(obj1);
            }else{
                //IN Quadrant 4 right part
                console.log("in quadrant 4");

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
                let obj1 = {x: midpointX, y:midpointY,name: treeNames[index]};
                ringCoordinates.push(obj1);
            }
            index++;
            
        })

        // for(let degreeIt = 360; degreeIt > 0; degreeIt=degreeIt-degreePerTree){
        //     console.log("degreeIt ", degreeIt);

        //     //in Quadrant1 top part
        //     if(degreeIt <= quadrant1TransitionDegree || degreeIt > quadrant4TransitionDegree ){
        //         console.log("in quadrant 1");
        //         let b = smallerRect.height / 2;
        //         let a =  (Math.tan(degreeIt * Math.PI / 180)) * b;
        //         let slope = a/b;
        //         let c = b + ((biggerRectHeight - smallerRect.height)/2);
        //         let y = c* slope;

        //         let x1 = biggerRectWidth/2 - y;
        //         let y1 = 0;
        //         let x2 = biggerRectWidth/2 - a;
        //         let y2 = (biggerRectHeight - smallerRect.height)/2;

        //         let midpointX = (x1 + x2)/ 2;
        //         let midpointY = (y1 + y2)/ 2;
        //         let obj1 = {x: midpointX, y:midpointY, name: treeNames[index]};
        //         ringCoordinates.push(obj1);
                
        //     }else if(degreeIt > quadrant1TransitionDegree && degreeIt <= quadrant2TransitionDegree){
        //         //IN Quadrant 2 left part
        //         console.log("in quadrant 2");

        //         let quad2Degree = 90 - degreeIt;
        //         let b = smallerRect.width /2;
        //         let a = (Math.tan(quad2Degree * Math.PI / 180)) * b;
        //         let slope = a/b;
        //         let c = b + ((biggerRectWidth-smallerRect.width)/2);
        //         let y =  slope*c;

        //         let x1 = 0;
        //         let y1 = (biggerRectHeight/2) - y;
        //         let x2 = c-b;
        //         let y2 = (biggerRectHeight/2) - a;

        //         let midpointX = (x1 + x2)/ 2;
        //         let midpointY = (y1 + y2)/ 2;
        //         let obj1 = {x: midpointX, y:midpointY, name: treeNames[index]};
        //         ringCoordinates.push(obj1);
        //     }else if(degreeIt > quadrant2TransitionDegree && degreeIt <= quadrant3TransitionDegree){
        //         //IN Quadrant 3 bottom part
        //         console.log("in quadrant 3");

        //         let quad3Degree = 180 - degreeIt;
        //         let b = smallerRect.height /2;
        //         let a = (Math.tan(quad3Degree * Math.PI / 180)) * b;
        //         let slope = a/b;
        //         let c = b + ((biggerRectHeight-smallerRect.height)/2);
        //         let y =  slope*c;

        //         let x1 = biggerRectWidth/2 - y;
        //         let y1 = biggerRectHeight;
        //         let x2 =  biggerRectWidth/2 - a;
        //         let y2 = (biggerRectHeight/2) + b;

        //         let midpointX = (x1 + x2)/ 2;
        //         let midpointY = (y1 + y2)/ 2;
        //         let obj1 = {x: midpointX, y:midpointY, name: treeNames[index]};
        //         ringCoordinates.push(obj1);
        //     }else{
        //         //IN Quadrant 4 right part
        //         console.log("in quadrant 4");

        //         let quad4Degree = 270 - degreeIt;
        //         let b = smallerRect.width /2;
        //         let a = (Math.tan(quad4Degree * Math.PI / 180)) * b;
        //         let slope = a/b;
        //         let c = b + ((biggerRectWidth-smallerRect.width)/2);
        //         let y =  slope*c;

        //         let x1 = biggerRectWidth;
        //         let y1 = (biggerRectHeight/2) + y;
        //         let x2 =  (biggerRectWidth/2) + b;
        //         let y2 = (biggerRectHeight/2) + a;

        //         let midpointX = (x1 + x2)/ 2;
        //         let midpointY = (y1 + y2)/ 2;
        //         let obj1 = {x: midpointX, y:midpointY,name: treeNames[index]};
        //         ringCoordinates.push(obj1);
        //     }
        //     index++;
            
        // }

        console.log("ringCoordinates ", ringCoordinates)



        //Set height of div
        //d3.select(divId).style("height",  d3.select(".mainArea").style("height")/5).attr("class", "overDivs")
            //.attr("width",  d3.select(".mainArea").style("width"));
            d3.select(divId).attr("class", "overDivs").attr("overflow", "hidden")

        const svg = d3.select(divId).append('svg').attr("width", stateWidth).attr("height", stateHeight);

        //Get rectangle of tree icicle position, height, width
        console.log("rect ", d3.select("#treeIcicle").select("svg").node().getBoundingClientRect())

        svg.append('g').selectAll("circle")
        .data(ringCoordinates)
        .enter().append("circle")
        .attr("r", 10)
        .attr("cx", function(d) { 
            return  d.x; 
        } )
        .attr("cy",  function(d) { 
            return  d.y; 
        })
        .style("fill", "black")
        .on("mouseover", function(event, d){
            console.log("hovered over ", d.name)
        })

        //Makes the thing in front
        d3.select("#treeIcicle").raise();
        d3.select("#helpIconDiv").raise();
        d3.select(divId).style("height", 5 + 'px');
        
    }

    render(){
        console.log("Rendering for Tree Ring")
      
        return <div id={this.props.id} ref={this.chartRef} ></div>
    }//end render
}//end class
export default TreeRing;
