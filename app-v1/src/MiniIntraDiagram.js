import React from 'react';
import RealMiniIntraDiagram from './RealMiniIntraDiagram';
import EmptyMini from './EmptyMini';

class MiniIntraDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of MiniIntraDiagram ", this.props.miniIntraShow);
    }//end constrcutor

    componentDidMount(){
        console.log("In componenet did mount for MiniIntraDiagram", this.props);
    }//end componentDidMount

    componentWillUnmount(){
        console.log("Unmount empty MiniIntraDiagram")
    }//end componentWillUnmount function

    render(){
        console.log("*******************************Rendering for MiniIntraDiagram state", this.props)
        const isMiniIntraShow = this.props.miniIntraShow;

        if(isMiniIntraShow){
            return <RealMiniIntraDiagram 
                id="realMiniIntraDiagram"
                treesIntraData={this.props.treesIntraData}
                uniqueNodeTypesAllTrees={this.props.uniqueNodeTypesAllTrees}
                selectedTreeName={this.props.selectedTreeName}
                selectedEdgeNamesIntraFilter={this.props.selectedEdgeNamesIntraFilter}
                selectedNodeNamesIntraFilter={this.props.selectedNodeNamesIntraFilter}
                selectedDirectionIntraFilter = {this.props.selectedDirectionIntraFilter}
                selectedNodeTypesIntraFilter= {this.props.selectedNodeTypesIntraFilter}
            >
            </RealMiniIntraDiagram>
        }else{
            return <EmptyMini id="emptyMiniIntraDiagramDiv"></EmptyMini>
        }
    }//end render
}//ene class

export default MiniIntraDiagram;