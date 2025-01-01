import React from 'react';
import RealMiniInterDiagram from './RealMiniInterDiagram';
import EmptyMini from './EmptyMini';

class MiniInterDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of MiniInterDiagram ", this.props.miniInterShow);
    }//end constructor

    componentDidMount(){
        console.log("In componenet did mount for MiniInterDiagram");
    }//end componentDidMount

    render(){
        console.log("Rendering for MiniInterDiagram state", this.props)
        const isMiniInterShow = this.props.miniInterShow;

        if(isMiniInterShow){
            return <RealMiniInterDiagram 
                id="realMiniInterDiagram"
                treesInterData={this.props.treesInterData}
                uniqueNodeTypesAllTrees={this.props.uniqueNodeTypesAllTrees}
                selectedTreeName={this.props.selectedTreeName}
                selectedEdgeNamesInterFilter = {this.props.selectedEdgeNamesInterFilter}
                selectedNodeNamesInterFilter = {this.props.selectedNodeNamesInterFilter}
                selectedNodeTypesInterFilter = {this.props.selectedNodeTypesInterFilter}
                selectedDirectionInterFilter = {this.props.selectedDirectionInterFilter}
            >
            </RealMiniInterDiagram>
        }else{
            return <EmptyMini id="emptyMiniInterDiagramDiv"></EmptyMini>
        }
    }//end render
}//ene class

export default MiniInterDiagram;