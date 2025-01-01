import React from 'react';
import * as d3 from "d3";

class TreeIcicleInterArrows extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of TreeIcicleInterArrows");


        //this.state = {isChordDiagram: true, selectedTreeName: null};
        //isChordDiagram -> determines if main area renders chord diagram or tree/icicle
        //selectedTreeName -> name of tree selected from large chord diagram
        //this.handleChange = this.handleChange.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In componenet did mount for TreeIcicleInterArrows");
        
        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawTreeIcicleInterArrows();
        })

        window.addEventListener("resize", this.redrawChart);
    }//end componentDidMount function

    //Handles change when an arc is seleted in Chord Diagram
    handleChange(newValue, selectedTreeName){
        console.log("in handleChange mainArea with value ", newValue);
        //this.setState({isChordDiagram: newValue, selectedTreeName: selectedTreeName });
        this.props.handleMiniChordChange(!newValue, selectedTreeName)
    }//end handleChange function

    componentWillUnmount(){
        console.log("Unmount empty TreeIcicleInterArrows")
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
        this.drawTreeIcicleInterArrows = this.drawTreeIcicleInterArrows.bind(this);
        this.drawTreeIcicleInterArrows();
    }

    drawTreeIcicleInterArrows(){
        console.log(" in drawTreeIcicleInterArrows ", this.props);

        //TODO: get correct tree set
        let data = this.props.treesInterData[0];
        const divId = '#'+ this.props.id;
        const stateHeight = this.state.height ;
        const stateWidth = this.state.width;

        let coords = [];

        let transform =  (d3.select("#treeIcicleG").attr("transform")).split(" ");
        console.log("trans ", transform);
        let translate = (((transform[0].slice(0,-1)).split("("))[1]).split(",");
        console.log("translate ", translate);
        let scale = (((transform[1].slice(0,-1)).split("("))[1]);
        console.log("sclae ", scale);

        let icicleTransform = (((d3.select("#treeIcicleSVG").attr("transform").slice(0,-1)).split("("))[1]).split(",");
        console.log("icicleTransform ", icicleTransform);


        //Create data getting the x and y of each arrow
        for(let i = 0; i < data.length; i++){
            console.log("d is ", data[i]);

            if(data[i].startTree === this.props.selectedTreeName){
                console.log("Started tree name current tree find coords")
                //Find start tree node in tree icicle
                //console.log(d3.select("#treeIcicleG").selectAll("circle").nodes())
                let realX;
                let realY;
                d3.select("#treeIcicleG").selectAll("circle").nodes().forEach(function(d,i2){
                    //console.log(d3.select(d).node())
                    if(d3.select(d).data()[0].data.name === data[i].startNode){
                         realX = parseFloat(translate[0]) + ((d3.select(d).attr("cx"))*scale) + parseFloat(icicleTransform[0])
                         realY = parseFloat(translate[1]) + ((d3.select(d).attr("cy"))*scale) +  parseFloat(icicleTransform[1])
                    }
                })


               // console.log(d3.select("#treeRing").selectAll("circle").nodes())

                let endRealX = null;
                let endRealY = null;

                for(let j = 0; j < d3.select("#treeRing").selectAll("circle").nodes().length; j++){
                    if(endRealX === null){
                        //console.log(d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]).data()[0])
                        if(d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]).data()[0].name === data[i].endTree ){
                            //console.log("found end tree ", d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]))
                            
                            endRealX = d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]).data()[0].x;
                            endRealY = d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]).data()[0].y;
                        }
                        
                        //console.log("end bb ", endBB);
                    }
                }

                let obj = {startX: realX, startY: realY, endX: endRealX, endY: endRealY, myData: data[i] };
                coords.push(obj);

            }else{
                console.log("find start tree node ")

                 //console.log(d3.select("#treeIcicleG").selectAll("circle").nodes())
                 let realX = null;
                 let realY;

                for(let j = 0; j < d3.select("#treeRing").selectAll("circle").nodes().length; j++){
                    if(realX === null){
                        //console.log(d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]).data()[0])
                        if(d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]).data()[0].name === data[i].startTree ){
                            //console.log("found end tree ", d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]))
                            
                            realX = d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]).data()[0].x;
                            realY = d3.select(d3.select("#treeRing").selectAll("circle").nodes()[j]).data()[0].y;
                        }
                        
                        //console.log("end bb ", endBB);
                    }
                }

 
 
                // console.log(d3.select("#treeRing").selectAll("circle").nodes())
 
                 let endRealX = null;
                 let endRealY = null;

                 d3.select("#treeIcicleG").selectAll("circle").nodes().forEach(function(d,i2){
                    //console.log(d3.select(d).node())
                    if(d3.select(d).data()[0].data.name === data[i].endNode){
                        endRealX = parseFloat(translate[0]) + ((d3.select(d).attr("cx"))*scale) + parseFloat(icicleTransform[0])
                        endRealY = parseFloat(translate[1]) + ((d3.select(d).attr("cy"))*scale) +  parseFloat(icicleTransform[1])
                    }
                })
 

 
                 let obj = {startX: realX, startY: realY, endX: endRealX, endY: endRealY, myData: data[i] };
                 coords.push(obj);

                
               
            }
        }

        console.log("coords ", coords);

        d3.select(divId).attr("class", "overDivs").attr("overflow", "hidden")

        const svg = d3.select(divId).append('svg').attr("width", stateWidth).attr("height", stateHeight);

        //Draw lines
        svg.append('g').selectAll("path")
        .data(coords)
        .enter()
        .append('path')
        .attr("d", function(d){

            //TODO what to do with doubles?? line over line
            let x = d.startX;
            let y = d.startY;
            let parentX = d.endX;
            let parentY = d.endY;

            return "M" + x + "," + y
            + "C" + x + "," + (y + parentY)/2
            + " " + parentX + "," + (y + parentY)/2
            + " " + parentX + "," + parentY;
        })
        .attr("stroke", "black")
        .attr("dd", function(d){
            return d.myData.startNode + d.myData.endNode;
        })
        .attr('fill', 'none');

        // svg.append("line")
        //     .attr("x1",stateWidth/2)
        //     .attr("x2", stateWidth/2)
        //     .attr("y1", 0)
        //     .attr("y2", stateHeight)
        //     .attr("stroke", "blue")

        //     svg.append("line")
        //     .attr("x1", 0)
        //     .attr("x2", stateWidth)
        //     .attr("y1", stateHeight/2)
        //     .attr("y2", stateHeight/2)
        //     .attr("stroke", "blue")

        d3.select(divId).style("height", 5 + 'px');
        d3.select("#treeIcicleArrows").raise();
        
    }


    render(){
        console.log("Rendering for TreeIcicleInterArrows props ", this.props)
        //const isChordDiagram = this.props.isChordDiagram;

        return <div id={this.props.id} ref={this.chartRef} ></div>
    }//end render
}//end class
export default TreeIcicleInterArrows;
