import React from 'react';
import * as d3 from "d3";

class RealMiniChordDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of RealMiniChordDiagram");
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In componenet did mount for RealMiniChordDiagram");

        this.chartRef = React.createRef();

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawRealMiniChordDiagram();
        })

        window.addEventListener("resize", this.redrawChart);
    }//end componentDidMount

    componentDidUpdate(prevProps, prevState){
        console.log("in component did update for RealMiniChordDiagram");
        if(prevProps.selectedTreeName !== this.props.selectedTreeName){
            console.log("Change for RealMiniChordDiagram ", this.props.selectedTreeName);
            const divId = '#'+ this.props.id;
            let myDuration = 1500;
            
            this.drawRealMiniChordDiagram = this.drawRealMiniChordDiagram.bind(this);
            let drawFunc = this.drawRealMiniChordDiagram;

            setTimeout(function(){
                d3.select(divId).select("svg").remove();
                drawFunc();
            }, myDuration)
        }//end if
    } // end componentDidUpdate

    componentWillUnmount(){
        window.removeEventListener("resize", this.redrawChart, false);
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
        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();

        //Redraw the direct chord diagram
        this.drawRealMiniChordDiagram = this.drawRealMiniChordDiagram.bind(this);
        this.drawRealMiniChordDiagram();
    }//end redrawChart function

    // Highlights ribbon and arcs associated with ribbon
    highlightRibbon(event, ribbon){
        d3.selectAll('path.ribbon')
            .classed("fadedRibbon", function(d){
                let sourceBoolean = (d.source.index === ribbon.source.index) && (d.target.index === ribbon.target.index); 
                return !sourceBoolean;
            })
            .classed("outlinedArc", function(d){
                let sourceBoolean = (d.source.index === ribbon.source.index) && (d.target.index === ribbon.target.index); 
                return sourceBoolean;
            })

        d3.selectAll("path.arc").classed("faded", function(d){
                return !((ribbon.source.index === d.index) || (ribbon.target.index === d.index))
            })
            .classed("outlinedArc", function(d){
                return ((ribbon.source.index === d.index) || (ribbon.target.index === d.index))
            })
    }//end highlightRibbon function

    //Highlights arc and ribbons associated with it
    highlightArc(event, arc){
        d3.selectAll("path.arc").classed("faded", function(d){
                return !(d === arc);
            })
            .classed("outlinedArc", function(d){
                return (d === arc);
            })

        d3.selectAll('path.ribbon')
            .classed("fadedRibbon", function(d){
                return !((d.source.index === arc.index) || (d.target.index === arc.index))
            })
            .classed("outlinedArc", function(d){
                return (d.source.index === arc.index) || (d.target.index === arc.index);
            })
    }//end highlightArc function

    //Resets the chord diagram to be all the same opacity
    fade(node){
        d3.selectAll("path.arc").classed("faded", false).classed("outlinedArc", false)
        d3.selectAll("path.ribbon").classed("fadedRibbon", false).classed("outlinedArc", false);
    }//end fade function


    drawRealMiniChordDiagram(){
        console.log("In drawRealMiniChordDiagram");

        const divId = '#'+ this.props.id;
        const height = this.state.height ;
        const width = this.state.width;
        const margin = Math.min(width, height) * 0.07;
        const funcChange = this.props.miniChordDiagramChange;
        const funcEdgeChange = this.props.handleEdgeTypeSelect;
        const funcMinisChange = this.props.handleMiniIntraChange;
        const funcMiniIcicleChange = this.props.handleMiniIcicleChange;
        const selectedTreeName= this.props.selectedTreeName;

        let myZoom = d3.zoom().scaleExtent([1, 100]).on("zoom", (event) => {
            chart.attr("transform", event.transform);
        })

        const svg = d3.select(divId).append('svg').attr("width", width).attr("height", height)
            .style("border", "solid").style("border-color", "black")
            .on("dblclick", function(event,d){
                console.log("mini dbl click");
                let myDuration = 1500;
                chart.selectAll('path.ribbon').transition().duration(myDuration).style("opacity", 0);
                group.selectAll("path").transition().duration(myDuration).style("opacity", 0);
                d3.select("#treeIcicleG").selectAll("rect").transition().duration(myDuration).style("opacity", 0);
                d3.select("#treeIcicleG").selectAll("path").transition().duration(myDuration).style("opacity", 0);
                d3.select("#treeIcicleG").selectAll("circle").transition().duration(myDuration).style("opacity", 0);
                d3.select("#treeRing").selectAll("polygon").transition().duration(myDuration).style("opacity", 0);
                d3.select("#containerSVG").select("#rectBorder").transition().duration(myDuration).style("opacity", 0);
                d3.select("#containerSVG").select("#arrows").selectAll("path").transition().duration(myDuration).style("opacity", 0);

                let hh = {value: "Hierarchical", label: "Hierarchcial"};
                setTimeout(function(){
                    funcChange(false, null);
                    console.log("----------------------------------finish handleMainAreaChange");
                    funcEdgeChange(hh)
                    console.log("----------------------------------finish edge change");
                    funcMinisChange(false);
                    console.log("----------------------------------finish minis change");
                    funcMiniIcicleChange(false, null);
                    console.log("----------------------------------finish minis icicle change");
                }, myDuration)
            })
            .on("mouseover", function(event, d){
                d3.select(this).style("cursor", "pointer"); 
            })
            .on("mouseout", function(event, d){
                d3.select(this).style("cursor", "default"); 
            })
            .call(myZoom)
            .on("dblclick.zoom", null);

        svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white")

        const matrix = [];
        for(let i = 2; i < this.props.networkData.length; i++){
            matrix.push(this.props.networkData[i])
        }//end for loop

        //TODO: data needs to be in treetype grouped together order ************
        const treeTypesMatrix = this.props.networkData[1];
        const treeTypeDomain = [...new Set(treeTypesMatrix)];
        const treeNames = this.props.networkData[0];
        
        const innerRadius = Math.min(width, height) * 0.5 - margin;
        const outerRadius = innerRadius + 4;

        //TODO: Sort groups by tree type
        const chord = d3.chordDirected()
        .padAngle(6/innerRadius) // area between each group
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending)
        //.sortGroups(this.mySort)

        const chords = chord(matrix);

        const ribbons = d3.ribbonArrow()
            .radius(innerRadius - 0.5)
            .padAngle(1/innerRadius); //area between ribbons in same group


        const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'];
        const colorSetRGB = [ "rgb(102, 194, 165)", "rgb(252, 141, 98)", "rgb(141, 160, 203)", "rgb(231, 138, 195)", "rgb(166, 216, 84)"];
        const color2 = d3.scaleOrdinal()
        .domain(treeTypeDomain)
        .range(colorSet);

        const greyNumbers = [];
        colorSetRGB.forEach(function(d,i){
            let colorRGB = (d.substring(4)).slice(0 ,-1).split(", ");
            let greyScaleNumber = (0.299 * parseFloat(colorRGB[0])) + (0.587 * parseFloat(colorRGB[1])) + (0.114 * parseFloat(colorRGB[2]))
            greyNumbers.push(greyScaleNumber);
        })
        const sortedGreyNumbers = greyNumbers.sort(function(a, b){return a - b});

        const chart = svg.append('g').attr("id", "mychartMini");
        chart.attr("transform", "translate(" + width/2 + "," + height/2 + ")")

        //Fixes chart from jumping to corner problem
        let transformIdentity = d3.zoomIdentity.translate(width/2, height/2)
        svg.call(myZoom.transform, transformIdentity )

        //Draw ribbons
        chart.selectAll('path.ribbon')
            .data(chords).join('path').attr("class", 'ribbon')
            .attr("d", ribbons)
            .attr("opacity", 0.5)
            .style("fill", function(d){
                let currentTreeType = treeTypesMatrix[d.source.index];
                let colorStringHex = color2(currentTreeType);
                let rgbIndex = colorSet.indexOf(colorStringHex);
                let colorString = colorSetRGB[rgbIndex];
                let colorRGB = (colorString.substring(4)).slice(0 ,-1).split(", ");

                let greyScaleNumber = (0.299 * parseFloat(colorRGB[0])) + (0.587 * parseFloat(colorRGB[1])) + (0.114 * parseFloat(colorRGB[2]))
                let indexGrey = sortedGreyNumbers.findIndex(function (element) {
                    return element === greyScaleNumber;
                });
                let interPolateNumber = 0.3 + indexGrey*0.075;

                if(treeNames[d.source.index] === selectedTreeName || treeNames[d.target.index] === selectedTreeName){
                    let newNumber = 255 - (55);
                    let greyScaleString =  newNumber.toString();
                    let greyScaleTotalString = "rgb(" + greyScaleString + "," + greyScaleString + ",0)";

                    return greyScaleTotalString
                }else{
                    return d3.interpolateGreys(interPolateNumber);
                }
            })
            .on("mouseover", this.highlightRibbon)
            .on("mouseout", this.fade)

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        let group = chart.append('g').attr("id", "treeArcs").selectAll('g').data(chords.groups).join('g')

        //Draw the outer arcs, each arc represents a tree
        group.append("path")
            .attr("class", "arc")
            .attr("degreeMidpoint", function(d){
                return (((d.endAngle + d.startAngle)/2)/Math.PI)*180
            })
            .attr("d",arc)
            .style("fill", function(d){
                let currentTreeType = treeTypesMatrix[d.index];
                let colorStringHex = color2(currentTreeType);
                let rgbIndex = colorSet.indexOf(colorStringHex);
                let colorString = colorSetRGB[rgbIndex];
                let colorRGB = (colorString.substring(4)).slice(0 ,-1).split(", ");
                let greyScaleNumber = (0.299 * parseFloat(colorRGB[0])) + (0.587 * parseFloat(colorRGB[1])) + (0.114 * parseFloat(colorRGB[2]))

                let indexGrey = sortedGreyNumbers.findIndex(function (element) {
                    return element === greyScaleNumber;
                });
                let interPolateNumber = 0.3 + indexGrey*0.075;


                if(treeNames[d.index] === selectedTreeName){
                    let newNumber = 255 - (55);
                    let greyScaleString =  newNumber.toString();
                    let greyScaleTotalString = "rgb(" + greyScaleString + "," + greyScaleString + ",0)";

                    return greyScaleTotalString
                }else{
                    return  d3.interpolateGreys(interPolateNumber);
                }
            })
            .on("mouseover", this.highlightArc)
            .on("mouseout", this.fade)
    }//end drawRealMiniChordDiagram function

    render(){
        console.log("Rendering for RealMiniChordDiagram")
      
        return <div id={this.props.id} ref={this.chartRef} ></div>
    }//end render
}//end class

export default RealMiniChordDiagram;