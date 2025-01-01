import React from 'react';
import * as d3 from "d3";

class EmptyMiniChordDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("In consructor of EmptyMiniChordDiagram");
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In componenet did mount for EmptyMiniChordDiagram");

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            console.log("In component di mount drawing");
            this.drawEmptyMiniChordDiagram();
        })

        window.addEventListener("resize", this.redrawChart);
    }//end componenrDidMount function

    componentWillUnmount(){
        console.log("Unmount empty mini chord diagram")
        window.removeEventListener("resize", this.redrawChart);
    }//end componentWillUnmount function

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
        console.log("Redrawing empty mini chord diagram")
        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();

        //Redraw the direct chord diagram
        this.drawEmptyMiniChordDiagram = this.drawEmptyMiniChordDiagram.bind(this);
        this.drawEmptyMiniChordDiagram();
    }

    drawEmptyMiniChordDiagram(){
        console.log("In drawEmptyMiniChordDiagram");

        const divId = '#'+ this.props.id;
        const height = this.state.height ;
        const width = this.state.width;

        const svg = d3.select(divId).append('svg').attr("width", width).attr("height", height)
            .style("border", "solid").style("border-color", "black");

        svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "white")
    }//end drawEmptyMiniChordDiagram function

    render(){
        console.log("Rendering for EmptyMiniChordDiagram")
      
        return <div id={this.props.id} ref={this.chartRef} ></div>
    }
}

export default EmptyMiniChordDiagram;