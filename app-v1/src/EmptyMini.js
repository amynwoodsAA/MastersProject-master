import React from 'react';
import * as d3 from "d3";

class EmptyMini extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of EmptyMini ", this.props.id);
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In component did mount for EmptyMini ", this.props.id);

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawEmptyMini();
        })

        window.addEventListener("resize", this.redrawChart);
    }//end componenrDidMount function

    componentWillUnmount(){
        console.log("Unmount EmptyMini ", this.props.id)
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

    //Redraw the empty mini when screen size changes
    redrawChart(){
        //Gets and resets the height and width
        console.log("Redrawing empty mini diagram ", this.props.id);
        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();

        //Redraw the direct chord diagram
        this.drawEmptyMini = this.drawEmptyMini.bind(this);
        this.drawEmptyMini();
    }

    drawEmptyMini(){
        console.log("In drawEmptyMini ", this.props.id);

        const divId = '#'+ this.props.id;
        const height = this.state.height ;
        const width = this.state.width;

        const svg = d3.select(divId).append('svg').attr("width", width).attr("height", height)
            .style("border", "solid").style("border-color", "black");

        svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "white")
    }//end drawEmptyMini function

    render(){
        console.log("Rendering for EmptyMini ", this.props.id)
        return <div id={this.props.id} ref={this.chartRef} ></div>
    } // end render function
}//end class

export default EmptyMini;