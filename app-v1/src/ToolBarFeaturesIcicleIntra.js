import React from 'react';
import { default as ReactSelect } from "react-select";
import { components } from "react-select";

class ToolBarFeaturesIcicleIntra extends React.Component{
    constructor(props){
        super(props);
        console.log("In constructor of ToolBarFeaturesIcicleIntra ", this.props);
    }//end constrcutor

    componentDidMount(){
        console.log("In componenet did mount for ToolBarFeaturesIcicleIntra", this.props);
    }//end componentDidMount

    componentDidUpdate(prevProps, prevState){
        console.log("In componenet did update for ToolBarFeaturesIcicleIntra", this.props);
        if(prevProps.selectedTreeName !== this.props.selectedTreeName){
            console.log("Change selectedTRee name ");
            var myDuration = 1500;
            let selectRefEdgeNameFilter = this.selectRefEdgeNameFilter.commonProps;
            let selectRefNodeNameFilter = this.selectRefNodeNameFilter.commonProps;
            let selectRefNodeTypeFilter = this.selectRefNodeTypeFilter.commonProps;
            let selectRefDirectionFilter = this.selectRefDirectionFilter.commonProps;
            setTimeout(function(){
                selectRefEdgeNameFilter.clearValue();
                selectRefNodeNameFilter.clearValue();
                selectRefNodeTypeFilter.clearValue();
                selectRefDirectionFilter.clearValue();
            }, myDuration)
            this.render();
        }
    }
    
    //Get the inter data given name
    getSelectedTreeIntraData(data, name){
        let index = -1;
        for(let i = 0; i < data.length; i++){
            if(data[i][0].treeName === name){
                index = i;
                break;
            }
        }

        if(index === -1){
            return [];
        }else{
            return data[index];
        }
    }

    // Gets the tree hierarchy data given a name
    getSelectedTreeData(name, data){
        for(let i = 0; i < data.length; i++){
            if(data[i].name === name){
                return data[i];
            }
        }
        return -1;
    }

     //Traverse through tree and gets node name and type
    getNodeNames(node){
        let names = [];

        if(node.children != null){
    
          if(node.name != null){
            names.push([node.name, node.type])
          }
    
          for(let c = 0; c < node.children.length; c++){
            let namesReturned = this.getNodeNames( node.children[c]);
    
            for(let t = 0; t < namesReturned.length; t++){
              names.push(namesReturned[t]);
            }
          }
    
          return names;
        }else{
          names.push([node.name, node.type]);
          return names;
        }
    }

    render(){
        console.log("Rendering for ToolBarFeaturesIcicleIntra props ", this.props);

        let edgeNames = [];
        const selectedTreeIntraData = this.getSelectedTreeIntraData(this.props.treeIntraData, this.props.selectedTreeName);
        selectedTreeIntraData.forEach(function(d,i){
            edgeNames.push(d.edgeType);
        })

        let edgeNamesDomain = [...new Set(edgeNames)];
        edgeNamesDomain.sort();
        let edgeNameOptions = [];
    
        edgeNamesDomain.forEach(function(d,i){
          const newOption = { value: d, label: d};
          edgeNameOptions.push(newOption);
        })

        const currentTreeData = this.getSelectedTreeData(this.props.selectedTreeName, this.props.treeData)
        if(currentTreeData === -1){
            console.log("Error no tree in the data with ", this.props.selectedTreeName)
            return;
        }

        let nodeNamesAndTypes = this.getNodeNames(currentTreeData);
        let nodeNames = [];
        let nodeTypes = [];

        for(let i = 0; i < nodeNamesAndTypes.length; i++){
            nodeNames.push(nodeNamesAndTypes[i][0]);
            nodeTypes.push(nodeNamesAndTypes[i][1]);
        }
        let nodeNameDomain = [...new Set(nodeNames)];
        nodeNameDomain.sort();
        let nodeNamesOptions = [];
        nodeNameDomain.forEach(function(d,i){
            const newOption = { value: d, label: d};
            nodeNamesOptions.push(newOption);
        })

        let nodeTypeDomain = [...new Set(nodeTypes)];
        nodeTypeDomain.sort();
        let nodeTypesOptions = [];
        nodeTypeDomain.forEach(function(d,i){
            const newOption = { value: d, label: d};
            nodeTypesOptions.push(newOption);
        })

        let directionOptions = [{value: "Outgoing", label: "Outgoing"}, {value: "Incoming", label:"Incoming"}, {value: "Either", label: "Either" }];
        let edgeTypeOptions = [{value: "Hierarchical", label: "Hierarchical"}, {value: "Intra", label:"Intra"}, {value: "Inter", label: "Inter" }];

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
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              display: "initial",
            }),
            option: (provided) => ({
              ...provided,
              color: 'white',
            })
          }

        
        return (
            <div className="toolBarFilter">
                <div style={{width: '20%', paddingRight: '0.5%', paddingLeft: '0%', paddingTop: '2px'}}>
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

                <div style={{width: '20%', paddingRight: '0.5%', paddingLeft: '0%', paddingTop: '2px'}}>
                    <ReactSelect
                        id="EdgeNameFilter"
                        ref={ref => {
                            this.selectRefEdgeNameFilter = ref;
                        }}
                        options={edgeNameOptions}
                        isMulti
                        controlShouldRenderValue = { false }
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        components={{
                            Option
                        }}
                        placeholder={'Edge Names'}
                        autosize={false} 
                        onChange={this.props.handleEdgeNamesIntraFilterChange}
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

                <div style={{width: '20%', paddingRight: '0.5%', paddingLeft: '0%', paddingTop: '2px'}}>
                    <ReactSelect
                        ref={ref => {
                            this.selectRefNodeNameFilter = ref;
                        }}
                        options={nodeNamesOptions}
                        isMulti
                        controlShouldRenderValue = { false }
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        components={{
                            Option
                        }}
                        placeholder={'Node Names'}
                        autosize={false} 
                        onChange={this.props.handleNodeNamesIntraFilterChange}
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

                <div style={{width: '20%', paddingRight: '0.5%', paddingLeft: '0%', paddingTop: '2px'}}>
                    <ReactSelect
                        ref={ref => {
                            this.selectRefNodeTypeFilter = ref;
                        }}
                        options={nodeTypesOptions}
                        isMulti
                        controlShouldRenderValue = { false }
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        components={{
                            Option
                        }}
                        placeholder={'Node Types'}
                        autosize={false} 
                        onChange={this.props.handleNodeTypesIntraFilterChange}
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

                <div style={{width: '20%', paddingRight: '0%', paddingLeft: '0%', paddingTop: '2px'}}>
                <ReactSelect
                    ref={ref => {
                        this.selectRefDirectionFilter = ref;
                    }}
                    options={directionOptions}
                    controlShouldRenderValue = { false }
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    placeholder={'Direction'}
                    autosize={false} 
                    onChange={this.props.handleDirectionIntraFilterChange}
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
    }
}//end class

export default ToolBarFeaturesIcicleIntra;