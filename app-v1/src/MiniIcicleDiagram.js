import React from 'react';
import RealMiniIcicleDiagram from './RealMiniIcicleDiagram';
import EmptyMini from './EmptyMini';

class MiniIcicleDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of MiniIcicleDiagram ", this.props.miniIcicleShow);
    }//end constrcutor

    componentDidMount(){
        console.log("In componenet did mount for MiniIcicleDiagram", this.props);
    }//end componentDidMount

    render(){
        console.log("Rendering for MiniIcicleDiagram state", this.props)
        const isMiniIcicleShow = this.props.miniIcicleShow;

        if(isMiniIcicleShow){ 
            return <RealMiniIcicleDiagram 
            id="realMiniIcicleDiagram"
                selectedMiniIcicleTreeName={this.props.selectedMiniIcicleTreeName}
                treeData={this.props.treeData}
                uniqueNodeTypesAllTrees={this.props.uniqueNodeTypesAllTrees}
                treesInterData={this.props.treesInterData}
                selectedTreeName={this.props.selectedTreeName}
                selectedEdgeType={this.props.selectedEdgeType}
                treeIntraData={this.props.treeIntraData} 
                selectedEdgeNamesInterFilter = {this.props.selectedEdgeNamesInterFilter}
                selectedNodeNamesInterFilter = {this.props.selectedNodeNamesInterFilter}
                selectedNodeTypesInterFilter = {this.props.selectedNodeTypesInterFilter}
                selectedDirectionInterFilter = {this.props.selectedDirectionInterFilter}
            ></RealMiniIcicleDiagram>
        }else{
            return <EmptyMini id="emptyMiniIcicleDiagramDiv"></EmptyMini>
        }//end else

    }//end render
}//ene class

export default MiniIcicleDiagram;