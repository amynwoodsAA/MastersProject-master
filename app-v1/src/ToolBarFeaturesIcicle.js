import React from 'react';
import { default as ReactSelect } from "react-select";
import ToolBarFeaturesIcicleInter from './ToolBarFeaturesIcicleInter';
import ToolBarFeaturesIcicleIntra from './ToolBarFeaturesIcicleIntra';

class ToolBarFeaturesIcicle extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of ToolBarFeaturesIcicle ", this.props);
    }//end constrcutor

    componentDidMount(){
        console.log("In componenet did mount for ToolBarFeaturesIcicle", this.props);
    }//end componentDidMount

    render(){
        console.log("Rendering for ToolBarFeaturesIcicle props ", this.props);
        const selectedEdgeType= this.props.selectedEdgeType.value;

        const colorStyles = {
            placeholder: (provided) => ({
              ...provided,
              color: 'white',
            }),
            option: (provided) => ({
              ...provided,
              color: 'white',
            })
          }

        let edgeTypeOptions = [{value: "Hierarchical", label: "Hierarchical"}, {value: "Intra", label:"Intra"}, {value: "Inter", label: "Inter" }];
       
        if(selectedEdgeType === "Hierarchical"){
            return (
                <div className="toolBarFilter" style={{height: '100%'}}>
                    <div style={{width: '50%', paddingRight: '0.5%', paddingLeft: '0%', paddingTop: '2px'}}>
                        <ReactSelect
                            options={edgeTypeOptions}
                            controlShouldRenderValue = { false }
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            placeholder={'Edge Types'}
                            autosize={false} 
                            onChange={this.props.handleEdgeTypeSelect}
                            theme={(theme) => ({
                            ...theme,
                            borderRadius: 0,
                            colors: {
                            ...theme.colors,
                                primary25: 'dimgray',
                                primary: 'black',
                                neutral0: 'darkgray',
                            },
                            })}
                            styles={colorStyles}
                        >

                        </ReactSelect>
                    </div>
                </div>
            )
        }else if(selectedEdgeType === "Intra"){
            return (
                <ToolBarFeaturesIcicleIntra
                    handleEdgeTypeSelect = {this.props.handleEdgeTypeSelect}
                    selectedTreeName={this.props.selectedTreeName} 
                    treeIntraData={this.props.treeIntraData}
                    handleEdgeNamesIntraFilterChange = {this.props.handleEdgeNamesIntraFilterChange}
                    treeData={this.props.treeData}
                    handleNodeNamesIntraFilterChange = {this.props.handleNodeNamesIntraFilterChange}
                    handleDirectionIntraFilterChange = {this.props.handleDirectionIntraFilterChange}
                    handleNodeTypesIntraFilterChange= {this.props.handleNodeTypesIntraFilterChange}
                ></ToolBarFeaturesIcicleIntra>
            )
        }else{
            return (
                <ToolBarFeaturesIcicleInter
                handleEdgeTypeSelect = {this.props.handleEdgeTypeSelect}
                selectedTreeName={this.props.selectedTreeName}
                treeInterData={this.props.treeInterData}
                treeData={this.props.treeData}
                handleEdgeNamesInterFilterChange = {this.props.handleEdgeNamesInterFilterChange}
                handleNodeNamesInterFilterChange = {this.props.handleNodeNamesInterFilterChange}
                handleNodeTypesInterFilterChange = {this.props.handleNodeTypesInterFilterChange}
                handleDirectionInterFilterChange = {this.props.handleDirectionInterFilterChange}
                ></ToolBarFeaturesIcicleInter>
            )
        }
    }
}//end class

export default ToolBarFeaturesIcicle;