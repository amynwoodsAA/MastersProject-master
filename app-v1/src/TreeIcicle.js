import React from 'react';
import TreeIcicleHierarchical from './TreeIcicleHierarchical';
import TreeIcicleIntra from './TreeIcicleIntra';
import TreeIcicleInter from './TreeIcicleInter';

class TreeIcicle extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of TreeIcicle ", this.props.miniChordShow);
    }//end constrcutor

    componentDidMount(){
        console.log("In componenet did mount for TreeIcicle", this.props);
    }//end componentDidMount

    render(){
        console.log("Rendering for TreeIcicle state", this.props.selectedEdgeType.value)
        const selectedEdgeType = this.props.selectedEdgeType.value;
        
        if(selectedEdgeType === "Hierarchical"){
            return <TreeIcicleHierarchical 
                id="treeIcicle" 
                data={this.props.data}
                networkData={this.props.networkData}
                treeData={this.props.treeData} 
                selectedTreeName={this.props.selectedTreeName}
                uniqueNodeTypesAllTrees={this.props.uniqueNodeTypesAllTrees}
                handleMiniIcicleChange={this.props.handleMiniIcicleChange}
                handleRingDblClickChange = {this.props.handleRingDblClickChange}
                treesInterData={this.props.treesInterData}
                treeIntraData={this.props.treeIntraData}
                selectedMiniIcicleTreeName={this.props.selectedMiniIcicleTreeName}
            ></TreeIcicleHierarchical>
        }else if(selectedEdgeType === "Intra"){
            return <TreeIcicleIntra 
                id="treeIcicle" 
                data={this.props.data}
                networkData={this.props.networkData} 
                treeData={this.props.treeData} 
                selectedTreeName={this.props.selectedTreeName}
                uniqueNodeTypesAllTrees={this.props.uniqueNodeTypesAllTrees}
                treeIntraData={this.props.treeIntraData}
                treesInterData={this.props.treesInterData}
                selectedEdgeNamesIntraFilter={this.props.selectedEdgeNamesIntraFilter}
                selectedNodeNamesIntraFilter={this.props.selectedNodeNamesIntraFilter}
                selectedDirectionIntraFilter={this.props.selectedDirectionIntraFilter}
                handleMiniIcicleChange={this.props.handleMiniIcicleChange}
                selectedNodeTypesIntraFilter={this.props.selectedNodeTypesIntraFilter}
                handleRingDblClickChange = {this.props.handleRingDblClickChange}
                selectedMiniIcicleTreeName={this.props.selectedMiniIcicleTreeName}
            ></TreeIcicleIntra>
        }else if(selectedEdgeType === "Inter"){
            return <TreeIcicleInter 
                id="treeIcicle" data={this.props.data}
                networkData={this.props.networkData}
                treeData={this.props.treeData} 
                selectedTreeName={this.props.selectedTreeName}
                uniqueNodeTypesAllTrees={this.props.uniqueNodeTypesAllTrees}
                treeIntraData={this.props.treeIntraData}
                treesInterData={this.props.treesInterData}
                handleMiniIcicleChange={this.props.handleMiniIcicleChange}
                selectedEdgeNamesInterFilter = {this.props.selectedEdgeNamesInterFilter}
                selectedNodeNamesInterFilter = {this.props.selectedNodeNamesInterFilter}
                selectedNodeTypesInterFilter = {this.props.selectedNodeTypesInterFilter}
                selectedDirectionInterFilter = {this.props.selectedDirectionInterFilter}
                handleRingDblClickChange = {this.props.handleRingDblClickChange}
                selectedMiniIcicleTreeName={this.props.selectedMiniIcicleTreeName}
            ></TreeIcicleInter>
        }//end else
        return null;
    }//end render
}//end class

export default TreeIcicle;