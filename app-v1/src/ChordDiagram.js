import React from 'react';
import * as d3 from "d3";

class ChordDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("in constructor ChordDiagram")
        this.redrawChart= this.redrawChart.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("Calling Componenet did mount for ChordDiagram", this.props)

        this.chartRef = React.createRef();

        //Sets the width/height of the mainArea based on window size
        let width = this.getWidth();
        let height = this.getHeight();
        this.setState({width: width, height: height}, ()  => {
            //this.drawDirectedChordDiagram();
        })

        //Draw a tooltip for colorLegend
        d3.select('.mainArea').append('div')
        .attr("class", "myTooltip")
        .attr("id", "tooltip")

        d3.select('.mainArea').append('div')
        .attr("class", "myTooltip")
        .attr("id", "tooltip3")

        window.addEventListener("resize", this.redrawChart);
    }//end componentDidMount function

    componentWillUnmount(){
        console.log("unmount chord diagram")
        window.removeEventListener("resize", this.redrawChart, false);
        d3.select('.mainArea').select("#tooltip").remove();
        d3.select('.mainArea').select("#tooltip3").remove();
    }//end componentWillUnmount

    componentDidUpdate(){
        console.log("componentDidUpdate chord diagram", this.props);
        //Remove previously made svgs and divs
        const divsvgId = '#'+ this.props.id + " svg";
        const divDivId = '#'+ this.props.id + " div";
        d3.select(divsvgId).remove();
        d3.select(divDivId).remove();
        d3.select('#tooltip').select("svg").remove();
        this.drawDirectedChordDiagram();
    }//end componentDidUpdate

    //Get the width of the div
    getWidth(){
        const divId = '#'+ this.props.id;
        return d3.select(divId).node().getBoundingClientRect().width;
    }//end getWidth function

    //Get the height of the main area
    getHeight(){
        return d3.select('.mainArea').node().getBoundingClientRect().height;
    }//end getHeight function

    //Redraws the chord directed diagram when window size changes
    redrawChart() {
        console.log("in redraw chart chord diagram")

        //Gets and resets the height and width
        let width = this.getWidth()
        this.setState({width: width});
        let height = this.getHeight()
        this.setState({height: height});

        //Remove previously made svgs and divs
        const divsvgId = '#'+ this.props.id + " svg";
        const divDivId = '#'+ this.props.id + " div";
        d3.select(divsvgId).remove();
        d3.select(divDivId).remove();
        d3.select('#tooltip').select("svg").remove();

        //Redraw the direct chord diagram
        this.drawDirectedChordDiagram = this.drawDirectedChordDiagram.bind(this);
        this.drawDirectedChordDiagram();
    }//end redrawChart function

    //TODO: function to sort the data by tree type
    mySort(a, b){
        return d3.ascending(a,b);
    }//end mySort function

    //Highlights the arc being hovered and the ribbons go in and out of the arc
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

        d3.select(this).style("cursor", "pointer"); 
    }//end highlightArc function

    //Resets the chord diagram to be all the same opacity
    fade(node){
        d3.selectAll("path.arc").classed("faded", false).classed("outlinedArc", false)
        d3.selectAll("path.ribbon").classed("fadedRibbon", false).classed("outlinedArc", false);
        d3.select('.mainArea').select("#tooltip3").style('display', 'none');
        d3.select(this).style("cursor", "default"); 
    }//end fade function

    // Gets the tree hierarchy data given a name
    getSelectedTreeData(name, data){
        for(let i = 0; i < data.length; i++){
            if(data[i].name === name){
                return data[i];
            }
        }
        return -1;
    }//end getSelectedTreeData function

    drawDirectedChordDiagram(){
        console.log("In drawDirectedChordDiagram", this.props.chordDiagramSelectedTreeType)
        
        const divId = '#'+ this.props.id;
        const funcChange = this.props.onChange;
        const funcEventChange = this.props.handleEdgeTypeSelect;
        const handleMiniIntraChangeFunc = this.props.handleMiniIntraChange;
        const handleChordDiagramTreeTypeFilter=this.props.handleChordDiagramTreeTypeFilter;
        const handleChordDiagramTreeNameFilter=this.props.handleChordDiagramTreeNameFilter;
        let getTreeDataFunc = this.getSelectedTreeData;
        const treeData = this.props.treeData;

        //Get real height and width
        const height = this.state.height;
        const width = this.state.width;
        const margin = 50; //TODO: fix margin so tree name shows

        const selectedTreeTypes = this.props.chordDiagramSelectedTreeType;
        const selectedTreeNames = this.props.chordDiagramSelectedTreeName;
        //data needs to be in treetype grouped together order ************
        const origtreeTypesMatrix = this.props.networkData[1]
        const origtreeTypeDomain = [...new Set(origtreeTypesMatrix)];
        let treeTypesMatrix = this.props.networkData[1]
        let treeTypeDomain = [...new Set(treeTypesMatrix)];
        let treeNames = this.props.networkData[0]

        let matrix = []
        for(let i = 2; i < this.props.networkData.length; i++){
            matrix.push(this.props.networkData[i])
        }

        //Get the data of the tree type filter
        if(selectedTreeTypes.length !== 0 ){
            let cm = [];
            for(let row = 0; row < matrix.length; row++){
                let temp = [];
                for(let col = 0; col < matrix[row].length; col++){
                    temp.push(matrix[row][col]);
                }
                cm.push(temp)
            }

            let copyTreeTypesMatrix = []
            let copyTreeNames = []
            let copyTreeNames2 = []
            for(let i = 0; i < this.props.networkData[0].length; i++){
                copyTreeTypesMatrix.push(this.props.networkData[1][i])
                copyTreeNames.push(this.props.networkData[0][i])
                copyTreeNames2.push(this.props.networkData[0][i])
            }

            let adjustI = 0;
            copyTreeNames2.forEach(function(d,i){
                let filteredTreeType = false;

                for(let i2 = 0; i2 < selectedTreeTypes.length; i2++){
                    if(selectedTreeTypes[i2].value === copyTreeTypesMatrix[i-adjustI]){
                        filteredTreeType = true;
                        break;
                    }
                }

                if(!filteredTreeType){
                    copyTreeNames.splice(i - adjustI, 1);
                    copyTreeTypesMatrix.splice(i - adjustI,1);
                    for(let row = 0; row < cm.length; row++){
                        cm[row].splice(i- adjustI, 1);
                    }
                    
                    cm.splice(i-adjustI, 1);
                    adjustI++;
                }
            })
            treeTypesMatrix = copyTreeTypesMatrix;
            treeTypeDomain = [...new Set(treeTypesMatrix)]; 
            treeNames = copyTreeNames;
            matrix = cm;
        }//end if

        //check if tree name filter
        if(selectedTreeNames.length !== 0){
            //filter the tree names of the already filtered data
            let copyTreeTypesMatrix = [...treeTypesMatrix];
            let copyTreeNames = [...treeNames];
            let copyTreeNames2 = [...treeNames];
            let cm = JSON.parse(JSON.stringify(matrix));

            let adjustI = 0;

            copyTreeNames2.forEach(function(d,i){
                let filteredTreeName = false;
                for(let i2 = 0; i2 < selectedTreeNames.length; i2++){
                    if(selectedTreeNames[i2].value === copyTreeNames[i-adjustI]){
                        filteredTreeName = true;
                        break;
                    }
                }

                if(!filteredTreeName){
                    copyTreeNames.splice(i - adjustI, 1);
                    copyTreeTypesMatrix.splice(i - adjustI,1);

                    for(let row = 0; row < cm.length; row++){
                        cm[row].splice(i- adjustI, 1);
                    }
                    
                    cm.splice(i-adjustI, 1);
                    adjustI++;
                }
            })

            treeTypesMatrix = copyTreeTypesMatrix;
            treeTypeDomain = [...new Set(treeTypesMatrix)]; 
            treeNames = copyTreeNames;
            matrix = cm;
        }//end if

        if( matrix.length === 1 && matrix[0].length === 1){
            if(matrix[0][0] === 0){ 
                //Dont draw if nothing to draw
                return;
            }
        }


        let myZoom = d3.zoom().scaleExtent([1/2, 100]).on("zoom", (event) => {
            chart.attr("transform", event.transform);
        })

        //Create svg in div
        //TODO: remove padding of svg
        const svg = d3.select(divId).append('svg').attr("width", width).attr("height", height)
            .attr("id", "chordDiagramSVG")
            .call(myZoom)
            .on("dblclick.zoom", null);

        const innerRadius = Math.min(width, height) * 0.5 - margin;
        const outerRadius = innerRadius + 8;

        const chord = d3.chordDirected()
            .padAngle(12/innerRadius) // area between each group
            //.sortGroups(this.treeTypeSort) sort by arcs
            .sortSubgroups(d3.descending) //Sorting ribbons per group
            .sortChords(d3.descending) //Sort ribbons overlapping
            //.sortGroups(this.mySort)

        const chords = chord(matrix);

        const ribbons = d3.ribbonArrow()
            .radius(innerRadius - 0.5)
            .padAngle(1/innerRadius); //area between ribbons in same group

        // Define color scheme
        const colorSet = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'];
        const color = d3.scaleOrdinal()
        .domain(origtreeTypeDomain)
        .range(colorSet);

        //Create a grouping of the chord diagram chart
        const chart = svg.append('g').attr("id", "mychart")
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")")

        let transformIdentity = d3.zoomIdentity.translate(width/2, height/2)
        d3.select(divId).select("#chordDiagramSVG").call(myZoom.transform, transformIdentity )

        //Tooltip for outerarcs first
        let toolTip3 = d3.select('.mainArea').select("#tooltip3").style('display', 'none');

        //Draw ribbons
        chart.selectAll('path.ribbon')
            .data(chords).join('path').attr("class", 'ribbon')
            .attr("d", ribbons)
            .attr("opacity", 0.5)
            .style("fill", function(d){
                let currentTreeType = treeTypesMatrix[d.source.index];
                return color(currentTreeType)
            })
            .on("mouseover", function(event, ribbon){
                //Highlight ribbon and outer arcs associated
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

                // Fill the tooltip with content
                d3.select('.mainArea').select("#tooltip3").style('display', 'inline');
                let coords = d3.pointer( event,  d3.select('.mainArea').select("#chordDiagramSVG").node());
                d3.select('.mainArea').select("#tooltip3").html( "<span class='tooltip-text-bold'> Source:</span> " + treeNames[ribbon.source.index] 
                    + "<br/> <span class='tooltip-text-bold'> Target:</span> " + treeNames[ribbon.target.index] 
                    + "<br/> <span class='tooltip-text-bold'> # Edges:</span> " + ribbon.source.value)
                    .style("left", (coords[0] + 15) + "px")
                    .style("top", (coords[1]) + "px");

                
                let bb =  toolTip3.node().getBoundingClientRect();
                //Pass right boundary
                if(bb.x + bb.width > window.innerWidth){
                    let diff = (bb.x + bb.width) - window.innerWidth;
                    toolTip3.style("left", (coords[0] - diff + 15 ) + 'px')
                }
                let bb2 =  toolTip3.node().getBoundingClientRect();
                //Pass bottom boundary
                if(bb2.y + bb2.height > window.innerHeight){
                    let diff = (bb2.y + bb2.height) - window.innerHeight;
                    toolTip3.style("top", (coords[1] - diff ) + 'px')
                }
            })
            .on("mouseout", this.fade)

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        let group = chart.append('g').selectAll('g').data(chords.groups).join('g')
        let numberTreeTypes = [];

        //Draw the outer arcs, each arc represents a tree
        group.append("path")
            .attr("class", "arc")
            .attr("d",arc)
            .style("fill", function(d){
                let currentTreeType = treeTypesMatrix[d.index];

                if(numberTreeTypes[currentTreeType] == null){
                    numberTreeTypes[currentTreeType] = 1;
                }else{
                    numberTreeTypes[currentTreeType] += 1;
                }

                return color(currentTreeType);
            })
            .on("mouseover", this.highlightArc)
            .on("mouseout", this.fade)
            .on("dblclick", function(event,d){
                console.log("Dble click", d);
                console.log(" tree name ", treeNames[d.index])
                let myDuration = 1500;
                
                chart.selectAll('path.ribbon').transition().duration(myDuration).style("opacity", 0);
                group.selectAll("path").transition().duration(myDuration).style("opacity", 0);
                group.selectAll("text").transition().duration(myDuration).style("opacity", 0);
                helpIcon.selectAll("rect").transition().duration(myDuration).style("opacity", 0);
                helpIcon.selectAll("text").transition().duration(myDuration).style("opacity", 0);
                
                let no = false;
                let hh = {value: "Hierarchical", label: "Hierarchcial"};

                setTimeout(function(){
                    funcChange(no, treeNames[d.index]);
                    console.log("----------------------------------finish handleMainAreaChange");
                    funcEventChange(hh)
                    console.log("----------------------------------finish funcEventChange");
                    handleMiniIntraChangeFunc(true)
                    console.log("----------------------------------finish handleMiniIntraChangeFunc");
                    handleChordDiagramTreeTypeFilter([]);
                    console.log("----------------------------------finish handleChordDiagramTreeTypeFilter");
                    handleChordDiagramTreeNameFilter([]);
                    console.log("----------------------------------finish handleChordDiagramTreeNameFilter");
                }, myDuration)
            })

        //Draw the text for each tree name
        group.append("text")
            .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
            .attr("dy", "0.35em")
            .attr("transform", d => `
              rotate(${(d.angle * 180 / Math.PI - 90)})
              translate(${outerRadius + 5})
              ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => treeNames[d.index])
            .on("mouseover", function(event, d){
                var coords = d3.pointer( event, svg.node());
                let currentTreeType = treeTypesMatrix[d.index];

                //Get inter edges
                let intraEdges = matrix[d.index][d.index];

                toolTip3.style('display', 'inline');

                //Get number nodes
                const currentTreeData = getTreeDataFunc(treeNames[d.index] , treeData);
                let treeRootNode = d3.hierarchy(currentTreeData);
                treeRootNode.count();
                let numNodes = treeRootNode.copy().sum(d => 1).value;

                //Fill tooltip with content
                toolTip3.html( "<span class='tooltip-text-bold'>" + treeNames[d.index] 
                    + "</span> <br/> Tree Type: " + currentTreeType
                    + "<br/> # Edges: " + (d.value - intraEdges)
                    + "<br/> # Inter Edges: " + (d.value - (intraEdges*2))
                    + "<br/> # Intra Edges: " + intraEdges
                    + "<br/> # Nodes: " + numNodes)
                    .style("left", (coords[0]) + "px")
                    .style("top", (coords[1]) + "px");

                let bb =  toolTip3.node().getBoundingClientRect();
                //Pass right boundary
                if(bb.x + bb.width > window.innerWidth){
                    let diff = (bb.x + bb.width) - window.innerWidth;
                    toolTip3.style("left", (coords[0] - diff ) + 'px')
                }
                let bb2 =  toolTip3.node().getBoundingClientRect();
                //Pass bottom boundary
                if(bb2.y + bb2.height > window.innerHeight){
                    let diff = (bb2.y + bb2.height) - window.innerHeight;
                    toolTip3.style("top", (coords[1] - diff ) + 'px')
                }
            })
            .on("mouseout", function(event, d){
                toolTip3.style('display', 'none');
            });

        //TODO: Make into own function creating help icon and tooltip legend
        //Make tooltip legend and help icon
        const helpIcon = svg.append("g").attr("className", "helpIcon");
        let toolTip = d3.select('.mainArea').select("#tooltip").style('display', 'none');
        let toolTipSVG = d3.select("#tooltip").append("svg").attr("width", 200).attr("height", 200 )

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

        console.log("realtestsuzze ", realTextSize);

        //Draw the legend title for tooltip
        toolTipSVG.append('g').attr("id", "legendTitle").append("text")
            .attr("x", 0) //Changes later
            .attr("y", titleHeight)
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", titleHeight + "px")
            .text("Tree Types")
        
        //Draw circle for each tree type color
        toolTipSVG.append('g').attr("id", "legendCircles").attr("transform", "translate(0," + (titleHeight + titleHeightOffset) + ")")
        .selectAll('circle').data(treeTypeDomain).enter().append("circle")
            .attr("r", legendRadius)
            .attr("cx", (legendRadius + legendRadius*0.25))
            .attr("cy", function(d,i){
                let returnValue = i * (legendRadius + legendRadius*0.25) * 2 + legendRadius + legendHeightOffset;
                //Get max height of legend to fit tooltip
                if(i === treeTypeDomain.length - 1){
                    maxHeightLegend = returnValue + legendRadius + legendRadius*0.25;
                }//end if

                return returnValue;
            })
            .style("fill", function(d,i){
                return color(d);
            })
            .style("stroke", "black")

        //Draw text for each tree type
        toolTipSVG.append('g').attr("transform", "translate(0," + (titleHeight + titleHeightOffset) + ")")
        .attr("id", "legendTextPercentage").selectAll('text').data(treeTypeDomain).enter().append("text")
            .attr("x",  (legendRadius + legendRadius*0.25) )
            .attr("y", function(d,i){
                console.log(" somehting ",  (i * (legendRadius + legendRadius*0.25) * 2) + realTextSize + legendHeightOffset)
                return (i * (legendRadius + legendRadius*0.25) * 2) + realTextSize + legendHeightOffset
            })
            .style("fill", "black")
            .attr("text-anchor", "middle")
            .style("font-size", realTextSize- 2 + "px")
            .style("dominant-baseline", "middle")
            .text(function(d,i){
                return Math.round((numberTreeTypes[d]/treeTypesMatrix.length) * 100) + "%"
            })

        //Sets the tooltip to correct size height wise
        toolTipSVG.attr("height", maxHeightLegend + titleHeight + titleHeightOffset);
        let textLegendOffset = 5;

        //Draw text for each tree type
        toolTipSVG.append('g').attr("transform", "translate(0," + (titleHeight + titleHeightOffset) + ")")
        .attr("id", "legendText").selectAll('text').data(treeTypeDomain).enter().append("text")
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

        //Readjust the help icon to right top corner
        let currentPixelSize = parseFloat(helpIconQuestionMark.style("font-size")) * 2;
        helpIconQuestionMark.style("font-size", currentPixelSize + "px");
        let currentLength = (helpIconQuestionMark.node().getComputedTextLength());
        let borderSize = 3;
        let xShift = width - currentLength - borderSize ;
        let yShift = currentPixelSize;
        helpIconQuestionMark.attr("y", yShift - yShift*0.15 ).attr("x", xShift);

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

        helpIconQuestionMark.on("mouseover", function(event, d){
            let borderColor = "black";
            helpIcon.select("rect").style("stroke", borderColor).style("stroke-width", borderSize)

            toolTip
            .style('display', 'inline');

            toolTip
            .style("left", width - (maxLengthLegend + realTextSize*0.5 + legendRadius*2 + textLegendOffset) + "px")
            .style("top", 0 + (helpIconQuestionMark.node().getComputedTextLength() * 2) + "px")
        })
        .on("mouseout", function(event,d){
            helpIcon.select("rect").style("stroke", "none").style("stroke-width", 0);
            toolTip.style('display', 'none');
        })
    }//end drawDirectedChordDiagram function

    render(){
        console.log("Rendering for ChordDiagram")
        //console.log("data in chord diagram is ", this.props.data);
    
        return (
            <div id={this.props.id} ref={this.chartRef} ></div>
        )
    }//end render
}//end class
    
export default ChordDiagram;
    