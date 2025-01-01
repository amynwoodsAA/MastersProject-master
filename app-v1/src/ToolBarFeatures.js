import React from 'react';
import { default as ReactSelect } from "react-select";
import { components } from "react-select";
import ToolBarFeaturesIcicle from './ToolBarFeaturesIcicle';
import * as d3 from "d3";

class ToolBarFeatures extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of ToolBarFeatures ", this.props);
    }//end constrcutor

    componentDidMount(){
        console.log("In componenet did mount for ToolBarFeatures", this.props);
        const isChordDiagram = this.props.isChordDiagram;

        if(isChordDiagram){
            d3.select("#myToolBarContainer").style("height", '43.9px');
            let newHeight = window.innerHeight - 43.9;
            d3.select('.mainArea').style("height", newHeight + 'px')
        }
    }//end componentDidMount

    componentWillUnmount(){
        console.log(" in component did unmount for ToolbarFeatures");
    }//end componentWillUnmount

    render(){
        console.log("Rendering for Toolbarfeatures state", this.props.isChordDiagram);
        const isChordDiagram = this.props.isChordDiagram;
        const treeTypesMatrix = this.props.networkData[1]
        const treeTypeDomain = [...new Set(treeTypesMatrix)];
    
        let treeTypeOptions = [];
    
        treeTypeDomain.forEach(function(d,i){
          const newOption = { value: d, label: d};
          treeTypeOptions.push(newOption);
        })

        const treeNames = this.props.networkData[0]
        let treeNameOptions = [];
        treeNames.forEach(function(d,i){
          const newOption = {value: d, label: d};
          treeNameOptions.push(newOption);
        })

        const Option = (props) => {
            return ( 
            <div>
                <components.Option {...props}>
                <input
                    type="checkbox"
                    checked={props.isSelected}
                    onChange={() => null}
                />{" "}
                <label
                >{props.label}</label>
                </components.Option>
            </div>
            );
        };

        const colorStyles = {
            placeholder: (provided) => ({
              ...provided,
              color: 'white',
            }),
            option: (provided) => ({
              ...provided,
              color: 'white',
            }),
          }

        if(isChordDiagram){
            return   (                 
                <div className="toolBarFilter" style={{height: '100%'}}>
                    <div style={{width: '50%', paddingRight: '0.5%', paddingLeft: '0%', paddingTop: '2px'}}>
                        <ReactSelect
                            ref={ref => {
                                this.selectRefTreeTypeFilter = ref;
                            }}
                            options={treeTypeOptions}
                            isMulti
                            controlShouldRenderValue = { false }
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            components={{
                                Option
                            }}
                            placeholder={'Tree Types'}
                            autosize={false} 
                            onChange={this.props.handleChordDiagramTreeTypeFilter}
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

                    <div style={{width: '50%', paddingRight: '0%', paddingLeft: '0%',  paddingTop: '2px'}}>
                      <ReactSelect
                        ref={ref => {
                            this.selectRefTreeNameFilter = ref;
                        }}
                        options={treeNameOptions}
                        isMulti
                        controlShouldRenderValue = { false }
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        components={{
                          Option
                        }}
                        placeholder={'Tree Names'}
                        autosize={false} 
                        onChange={this.props.handleChordDiagramTreeNameFilter}
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
        }else{
            return (
                <ToolBarFeaturesIcicle
                    selectedEdgeType={this.props.selectedEdgeType}
                    handleEdgeTypeSelect = {this.props.handleEdgeTypeSelect}
                    selectedTreeName={this.props.selectedTreeName} 
                    treeIntraData={this.props.treeIntraData}
                    treeInterData={this.props.treeInterData}
                    handleEdgeNamesIntraFilterChange = {this.props.handleEdgeNamesIntraFilterChange}
                    treeData={this.props.treeData}
                    handleNodeNamesIntraFilterChange = {this.props.handleNodeNamesIntraFilterChange}
                    handleDirectionIntraFilterChange = {this.props.handleDirectionIntraFilterChange}
                    handleNodeTypesIntraFilterChange= {this.props.handleNodeTypesIntraFilterChange}
                    handleEdgeNamesInterFilterChange = {this.props.handleEdgeNamesInterFilterChange}
                    handleNodeNamesInterFilterChange = {this.props.handleNodeNamesInterFilterChange}
                    handleNodeTypesInterFilterChange = {this.props.handleNodeTypesInterFilterChange}
                    handleDirectionInterFilterChange = {this.props.handleDirectionInterFilterChange}
                ></ToolBarFeaturesIcicle>
            )
        }
    }
}//end class

export default ToolBarFeatures;