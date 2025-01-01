import React from 'react';
import ChordDiagram from './ChordDiagram';
import TreeIcicle from './TreeIcicle';
import HelpIcon from './HelpIcon';

class MainArea extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of Main Area");

        this.state = {isChordDiagram: true, selectedTreeName: null};
        //isChordDiagram -> determines if main area renders chord diagram or tree/icicle
        //selectedTreeName -> name of tree selected from large chord diagram
        this.handleChange = this.handleChange.bind(this);
    }//end constructor

    componentDidMount(){
        console.log("In componenet didd mount for main area");
    }//end componentDidMount function

    //Handles change when an arc is seleted in Chord Diagram
    handleChange(newValue, selectedTreeName){
        console.log("in handleChange mainArea with value ", newValue);
        this.props.handleMiniChordChange(!newValue, selectedTreeName)
    }//end handleChange function

    render(){
        console.log("Rendering for Main Area props ", this.props.isChordDiagram, " name ", this.props.selectedTreeName)
        const isChordDiagram = this.props.isChordDiagram;

        if(isChordDiagram){
            return <ChordDiagram 
                data={this.props.data} 
                networkData={this.props.networkData}
                id='bigChordDiagram' 
                onChange={this.handleChange}
                handleEdgeTypeSelect={this.props.handleEdgeTypeSelect}
                handleMiniIntraChange={this.props.handleMiniIntraChange}
                treeData={this.props.treeData}
                chordDiagramSelectedTreeType={this.props.chordDiagramSelectedTreeType}
                chordDiagramSelectedTreeName={this.props.chordDiagramSelectedTreeName}
                handleChordDiagramTreeTypeFilter={this.props.handleChordDiagramTreeTypeFilter}
                handleChordDiagramTreeNameFilter={this.props.handleChordDiagramTreeNameFilter}
            ></ChordDiagram>
        }else{
            return (
                <>
                    <HelpIcon className="overDivs" 
                        id="helpIconDiv" 
                        uniqueNodeTypesAllTrees={this.props.uniqueNodeTypesAllTrees}
                        treeData={this.props.treeData} 
                        selectedTreeName={this.props.selectedTreeName}
                    ></HelpIcon>

                    <TreeIcicle  id="treeIcicle" 
                        data={this.props.data} 
                        networkData={this.props.networkData}
                        treeData={this.props.treeData} 
                        selectedTreeName={this.props.selectedTreeName}
                        uniqueNodeTypesAllTrees={this.props.uniqueNodeTypesAllTrees}
                        selectedEdgeType={this.props.selectedEdgeType}
                        treeIntraData={this.props.treeIntraData}
                        treesInterData={this.props.treesInterData}
                        handleMiniIcicleChange={this.props.handleMiniIcicleChange}
                        selectedEdgeNamesIntraFilter={this.props.selectedEdgeNamesIntraFilter}
                        selectedNodeNamesIntraFilter={this.props.selectedNodeNamesIntraFilter}
                        selectedDirectionIntraFilter={this.props.selectedDirectionIntraFilter}
                        selectedNodeTypesIntraFilter = {this.props.selectedNodeTypesIntraFilter}
                        selectedEdgeNamesInterFilter = {this.props.selectedEdgeNamesInterFilter}
                        selectedNodeNamesInterFilter = {this.props.selectedNodeNamesInterFilter}
                        selectedNodeTypesInterFilter = {this.props.selectedNodeTypesInterFilter}
                        selectedDirectionInterFilter = {this.props.selectedDirectionInterFilter}
                        handleRingDblClickChange = {this.props.handleRingDblClickChange}
                        selectedMiniIcicleTreeName={this.props.selectedMiniIcicleTreeName}
                    ></TreeIcicle>
                </>
            )
        }//end else
    }//end render
}//end class
export default MainArea;
