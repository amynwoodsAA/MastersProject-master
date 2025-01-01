import React from 'react';
import RealMiniChordDiagram from './RealMiniChordDiagram';
import EmptyMini from './EmptyMini';

class MiniChordDiagram extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of MiniChordDiagram ", this.props.miniChordShow);
    }//end constrcutor

    render(){
        console.log("Rendering for MiniChordDiagram state", this.props.miniChordShow)
        const isMiniChordShow = this.props.miniChordShow;
        
        if(isMiniChordShow){
            return <RealMiniChordDiagram 
                id="realMiniChordDiagramDiv" 
                data={this.props.data}
                networkData={this.props.networkData} 
                selectedTreeName={this.props.selectedTreeName}
                miniChordDiagramChange={this.props.handleMiniChordChange}
                handleEdgeTypeSelect={this.props.handleEdgeTypeSelect}
                handleMiniIntraChange= {this.props.handleMiniIntraChange}
                handleMiniIcicleChange= {this.props.handleMiniIcicleChange}
             ></RealMiniChordDiagram>
        }else{
            return <EmptyMini id="emptyMiniChordDiagramDiv"></EmptyMini>
        }//end else
    }//end render
}//end class

export default MiniChordDiagram;