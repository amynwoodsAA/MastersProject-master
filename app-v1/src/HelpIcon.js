import React from 'react';
import * as d3 from "d3";

class HelpIcon extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of HelpIcon", this.props);
        this.redrawChartHelpIcon= this.redrawChartHelpIcon.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In componenet did mount for helpicon");  
        this.chartRef = React.createRef();
        this.getWidth2 = this.getWidth2.bind(this);

        //Sets the width/height of the miniChord area based on window size
        let width = this.getWidth2();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            this.drawHelpIcon();
        })

        d3.select('.mainArea').append('div')
        .attr("class", "myTooltip")
        .attr("id", "tooltip")

        window.addEventListener("resize", this.redrawChartHelpIcon);
    }//end componenrDidMount function

    componentDidUpdate(prevProps, prevState){
        console.log("In componenet did update for helpicon");  
        if(prevProps.selectedTreeName !== this.props.selectedTreeName){
            console.log("updating help icon cause tree changed");
            const divId = '#'+ this.props.id;
            d3.select(divId).select("svg").remove();
            d3.select("#tooltip").select("svg").remove();
            this.drawHelpIcon();
        }
    }//end componentDidUpdate function

    componentWillUnmount(){
        console.log("Unmount empty HelpIcon")
        window.removeEventListener("resize", this.redrawChartHelpIcon);
        d3.select('.mainArea').select("#tooltip").remove();
    }//end componentWillUnmount function

    //Get the width of the div
    getWidth2(){
        const divId = '#'+ this.props.id;
        return d3.select(divId).node().getBoundingClientRect().width;
    }//end getWidth function

    //Get the height of the main area
    getHeight(){
        return d3.select('.mainArea').node().getBoundingClientRect().height;
    }//end getHeight function

    //Redraws the helpicon when window size changes
    redrawChartHelpIcon() {
        console.log("in redraw helpicon")

        //Gets and resets the height and width
        let width = this.getWidth2();
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        //Remove previously made svgs and divs
        const divsvgId = '#'+ this.props.id + " svg";
        d3.select(divsvgId).remove();
        d3.select('#tooltip').select("svg").remove();

        //Redraw the direct chord diagram
        this.drawHelpIcon = this.drawHelpIcon.bind(this);
        this.drawHelpIcon();
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

    // Traverses through given tree (node) gets the type of each node
    traverse(node){
        let types = [];

        if(node.children != null){

            if(node.type != null){
                types.push(node.type)
            }

            for(let child = 0; child < node.children.length; child++){
                let typesReturned = this.traverse(node.children[child]);

                for(let t = 0; t < typesReturned.length; t++){
                    types.push(typesReturned[t]);
                }
            }

            return types;

        }else{
            types.push(node.type);
            return types;
        }
    }//end traverse function


    drawHelpIcon(){
        console.log("in draw help icon",  );
        const height = this.state.height;
        const width = this.state.width;
        const divId = '#'+ this.props.id;

        const selectedTreeName = this.props.selectedTreeName;
        const nodeTypes = this.props.uniqueNodeTypesAllTrees;
        const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494', '#ffffb3'];
        const color = d3.scaleOrdinal( )
        .domain(nodeTypes)
        .range(colorSet);

        d3.select(divId).attr("class", "overDivs")
        const svg = d3.select(divId).append('svg').attr("width", width).attr("height", height/4)
        const helpIcon = svg.append("g").attr("className", "helpIcon");
        let toolTip = d3.select('.mainArea').select("#tooltip").style('display', 'none');
        let toolTipSVG = d3.select("#tooltip").append("svg").attr("width", 200).attr("height", 200 )

        const currentTreeData = this.getSelectedTreeData(selectedTreeName, this.props.treeData)
        if(currentTreeData === -1){
            console.log("Error no tree in the data with ", selectedTreeName)
            return;
        }

        //Get percentage of node typed for legend tooltip
        let nodeTypesOfCurrentTree = this.traverse(currentTreeData);
        let nodeTypePercentage = {};
        nodeTypesOfCurrentTree.forEach(function(d,i){
            if( nodeTypePercentage[d] === undefined){
                nodeTypePercentage[d] = 1;
            }else{
                nodeTypePercentage[d] += 1;
            }
        })

        //Draw help icon
        //TODO: Maybe Change to grey circle make more stylized
        helpIcon.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "grey")
        const helpIconQuestionMark = helpIcon.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .text("?")

        //Variables for drawing legend tooltip
        let realTextSize = parseFloat(helpIconQuestionMark.style("font-size"));
        let legendRadius = realTextSize;
        let legendHeightOffset = realTextSize*0.25;
        let maxHeightLegend = 0;
        let maxLengthLegend = 0;
        let titleHeight = realTextSize + 2;
        let titleHeightOffset = titleHeight* 0.25;

        //Draw the legend title for tooltip
        toolTipSVG.append('g').attr("id", "legendTitle").append("text")
            .attr("x", 0) //Changes later
            .attr("y", titleHeight)
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", titleHeight + "px")
            .text("Node Types")

        //Draw circle for each tree type color
        toolTipSVG.append('g').attr("transform", "translate(0," + (titleHeight + titleHeightOffset) + ")")
        .selectAll('circle').data(nodeTypes).enter().append("circle")
            .attr("r", legendRadius)
            .attr("cx", (legendRadius + legendRadius*0.25))
            .attr("cy", function(d,i){
                let returnValue = i * (legendRadius + legendRadius*0.25) * 2 + legendRadius + legendHeightOffset;
                //Get max height of legend to fit tooltip
                if(i === nodeTypes.length - 1){
                    maxHeightLegend = returnValue + legendRadius + legendRadius*0.25;
                }//end if
                return returnValue;
            })
            .style("fill", function(d,i){
                return color(d);
            })
            .style("stroke", "black")

        //Sets the tooltip to correct size height wise
        toolTipSVG.attr("height", maxHeightLegend + titleHeight + titleHeightOffset);

        let textLegendOffset = 8;

        //Draw text for each tree type
        toolTipSVG.append('g').attr("transform", "translate(0," + (titleHeight + titleHeightOffset) + ")")
        .attr("id", "legendText").selectAll('text').data(nodeTypes).enter().append("text")
            .attr("x", legendRadius*2 + legendRadius*0.25 + textLegendOffset)
            .attr("y", function(d,i){
                return (i * (legendRadius + legendRadius*0.25) * 2) + realTextSize + legendHeightOffset
            })
            .style("fill", "black")
            .attr("text-anchor", "left")
            .style("dominant-baseline", "middle")
            .style("font-size", realTextSize + "px")
            .text(function(d,i){
                return d;
            })

        //Draw percentage for each tree type
        toolTipSVG.append('g').attr("transform", "translate(0," + (titleHeight + titleHeightOffset) + ")")
            .attr("id", "legendTextPercentage").selectAll('text').data(nodeTypes).enter().append("text")
                .attr("x",  (legendRadius + legendRadius*0.25) )
                .attr("y", function(d,i){
                    return (i * (legendRadius + legendRadius*0.25) * 2) + realTextSize + legendHeightOffset
                })
                .style("fill", "black")
                .attr("text-anchor", "middle")
                .style("dominant-baseline", "middle")
                .style("font-size", realTextSize- 2 + "px")
                .text(function(d,i){
                    let num = 0;

                    if(nodeTypePercentage[d] !== undefined){
                        num = Math.round((nodeTypePercentage[d] / nodeTypesOfCurrentTree.length)* 100)
                    }
                    return num + "%";
                })
    
        //Readjust the help icon to right top corner
        let currentPixelSize = parseFloat(helpIconQuestionMark.style("font-size")) * 2;
        helpIconQuestionMark.style("font-size", currentPixelSize + "px");
        let currentLength = (helpIconQuestionMark.node().getComputedTextLength());
        let borderSize = 3;
        let xShift = width - currentLength - borderSize ;
        let yShift = currentPixelSize;
        helpIconQuestionMark.attr("y", yShift - yShift*0.15 ).attr("x", xShift);
        svg.attr("height", yShift)

        helpIcon.select("rect")
            .attr("x", xShift - (helpIconQuestionMark.node().getComputedTextLength()) )
            .attr("y", 0)
            .attr("width", helpIconQuestionMark.node().getComputedTextLength() * 2)
            .attr("height", yShift)
            .attr("fill", "lightgrey")
            .on("mouseover", function(event, d){
                let borderColor = "black";
                d3.select(this).style("stroke", borderColor).style("stroke-width", borderSize);
    
                //Display tooltip
                toolTip.style('display', 'inline');
    
                if(maxLengthLegend === 0){
                    toolTipSVG.selectAll('text')
                    .each(function(d,i){
                        if(maxLengthLegend < this.getComputedTextLength()){
                            maxLengthLegend = this.getComputedTextLength();
                        }
                    })
                    //Fit the tooltip size and center legend title
                    let newWidth = maxLengthLegend + realTextSize*0.5 + legendRadius*2 + textLegendOffset;
                    toolTipSVG.attr("width", newWidth);
                    d3.select("#legendTitle").select("text").attr("x", newWidth/2)
                }
                toolTip
                    .style("left", width - (maxLengthLegend + realTextSize*0.5 +  legendRadius*2 + textLegendOffset)  + "px")
                    .style("top", 0 + (helpIconQuestionMark.node().getComputedTextLength() * 2)  + "px")
            })
            .on("mouseout", function(event,d){
                d3.select(this).style("stroke", "none").style("stroke-width", 0);
                toolTip.style('display', 'none');
            })

        d3.select(divId).style("height", 5 + 'px');
    }//end drawHelpIcon function

    render(){
        console.log("Rendering for HelpIcon props ", this.props.isChordDiagram, " name ", this.props.selectedTreeName);

        return <div id={this.props.id} ref={this.chartRef} ></div>
    }//end render
}//end class
export default HelpIcon;
