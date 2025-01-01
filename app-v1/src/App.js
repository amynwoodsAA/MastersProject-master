import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';

// import treeData1 from './datasets/test1.json';
// import treeData2 from './datasets/test2.json';
// import treeData4 from './datasets/test4.json';
// import treeData5 from './datasets/tree1.json';
// import treeData1Intra from './datasets/tree3IntraEdges.json';
// import treeData1Inter from './datasets/test1Inter.json';
// import treeData7Intra from './datasets/tree7Intra.json';
// import treeData7Inter from './datasets/tree7Inter.json';

//DummyData
//import networkData from './datasets/networkData.json'
// import treeData1 from './datasets/tree1.json';
// import treeData1Intra from './datasets/tree1Intra.json';
// import treeData1Inter from './datasets/tree1Inter.json';

// import treeData2 from './datasets/tree2.json';
// import treeData2Intra from './datasets/tree2Intra.json';
// import treeData2Inter from './datasets/tree2Inter.json';

// import treeData3 from './datasets/tree3.json';
// import treeData3Intra from './datasets/tree3Intra.json';
// import treeData3Inter from './datasets/tree3Inter.json';

// import treeData4 from './datasets/tree4.json';
// import treeData4Intra from './datasets/tree4Intra.json';
// import treeData4Inter from './datasets/tree4Inter.json';

// import treeData5 from './datasets/tree5.json';
// import treeData5Intra from './datasets/tree5Intra.json';
// import treeData5Inter from './datasets/tree5Inter.json';


import './App.css';
import MainArea from './MainArea';
import MiniChordDiagram from './MiniChordDiagram';
import MiniIcicleDiagram from './MiniIcicleDiagram';
import MiniIntraDiagram from './MiniIntraDiagram';
import MiniInterDiagram from './MiniInterDiagram';
import ToolBarFeatures from './ToolBarFeatures';

class App extends React.Component{
  constructor(props){
    console.log("in app constructor ")
    super(props);

    //Get the json files in datasets
    //TODO: Eventually connect to a database
    let jsonFiles = {};
    let r = require.context("./datasets", false, /\.(json)$/);
    r.keys().map((item, index) => { jsonFiles[item.replace('./', '')] = r(item); });

    let treesData = []; //Holds all the json files that define the tree structure
    let treesIntraData = []; //Holds all the json files that define the intra edges, one json per tree
    let treesInterData = []; //Holds all the json files that define the inter edges, one json per tree
    let networkData = 0; //Holds a 2d matrix of number of edges among all trees including intra edges

    //Put the json files into appropraite array
    for (const [key, value] of Object.entries(jsonFiles)) {
      let end = "";
      if(key.length > 10){
        end = key.substring(key.length - 10)
      } //end if

      if(key === "networkData.json"){
        networkData = jsonFiles[key];
      }else if(end === "Inter.json"){
        treesInterData.push(jsonFiles[key]);
      }
      else if(end === "Intra.json"){
        treesIntraData.push(jsonFiles[key]);
      }else{
        treesData.push(jsonFiles[key]);
      }//end else
    }//end for loop

    //Get all the node types among all the trees
    let uniqueNodeTypesAllTrees = [];
    for(let i = 0; i < treesData.length; i++){
      let nodeTypes = this.traverse( treesData[i]);
      let uniqueNodeTypes = [...new Set(nodeTypes)]
      for(let j = 0; j < uniqueNodeTypes.length; j++){
        uniqueNodeTypesAllTrees.push(uniqueNodeTypes[j]);
      }//end for loop
      uniqueNodeTypesAllTrees = [...new Set(uniqueNodeTypesAllTrees)]
    }//end for loop

    // Initialize the state
    this.state = {miniChordShow: false, // determines when the chord, miniChord, and certain toolbar features are shown
      miniIcicleShow: false, // determines when to show the mini icicle diagram
      miniIntraShow: false, // determines when to show the mini intra and inter 
      selectedTreeName: null, // name of tree selected from large chord diagram
      selectedMiniIcicleTreeName: null, // name of tree selected to be shown in mini icicle
      selectedEdgeType: "Hierarchical", // selected option from dropdown Edge Type
      chordDiagramSelectedTreeType: [], //selected options from dropdown Tree Type
      chordDiagramSelectedTreeName: [], //selected options from dropdown Tree Name
      selectedEdgeNamesIntraFilter: [], //selected options from dropdown Edge Names for intra view
      selectedNodeNamesIntraFilter: [], //selected options from dropdown Node Names for intra view
      selectedDirectionIntraFilter: {}, //selected options from dropdown Direction for intra view
      selectedNodeTypesIntraFilter: [], //selected options from dropdown Node Types for intra view
      selectedEdgeNamesInterFilter: [], //selected options from dropdown Edge Names for inter view
      selectedNodeNamesInterFilter: [], //selected options from dropdown Node Names for inter view
      selectedNodeTypesInterFilter: [], //selected options from dropdown Node Types for inter view
      selectedDirectionInterFilter: {}, //selected options from dropdown Direction for inter view
      treesData: treesData, //Holds all the json files that define the tree structure
      treesIntraData: treesIntraData, //Holds all the json files that define the intra edges, one json per tree
      treesInterData: treesInterData, //Holds all the json files that define the inter edges, one json per tree
      networkData: networkData,  //Holds a 2d matrix of number of edges among all trees including intra edges
      uniqueNodeTypesAllTrees: uniqueNodeTypesAllTrees // Holds all the node types among all the trees
    };

    //Bind the functions
    this.handleMainAreaChange = this.handleMainAreaChange.bind(this);
    this.handleMiniIcicleChange = this.handleMiniIcicleChange.bind(this);
    this.handleMiniIntraChange = this.handleMiniIntraChange.bind(this);
    this.traverse = this.traverse.bind(this);
    this.handleEdgeTypeSelect = this.handleEdgeTypeSelect.bind(this);
    this.handleChordDiagramTreeTypeFilter = this.handleChordDiagramTreeTypeFilter.bind(this);
    this.handleChordDiagramTreeNameFilter = this.handleChordDiagramTreeNameFilter.bind(this);
    this.handleEdgeNamesIntraFilterChange = this.handleEdgeNamesIntraFilterChange.bind(this);
    this.handleNodeNamesIntraFilterChange = this.handleNodeNamesIntraFilterChange.bind(this);
    this.handleDirectionIntraFilterChange = this.handleDirectionIntraFilterChange.bind(this);
    this.handleNodeTypesIntraFilterChange = this.handleNodeTypesIntraFilterChange.bind(this);
    this.handleEdgeNamesInterFilterChange = this.handleEdgeNamesInterFilterChange.bind(this);
    this.handleNodeNamesInterFilterChange = this.handleNodeNamesInterFilterChange.bind(this);
    this.handleNodeTypesInterFilterChange = this.handleNodeTypesInterFilterChange.bind(this);
    this.handleDirectionInterFilterChange = this.handleDirectionInterFilterChange.bind(this);
    this.handleRingDblClickChange = this.handleRingDblClickChange.bind(this);
    
  }//end constructor

  //Used for handling change when an arc is selected in the chord diagram, or double click in mini chord
  handleMainAreaChange(newValue, selectedTreeName){
    console.log("in handleMainAreaChange App with value ", newValue, " selected Tree ", selectedTreeName);
    this.setState({miniChordShow: newValue, selectedTreeName: selectedTreeName});
  }//end handleMainAreaChange function

  // Used of handling when a new tree is selected from arrow ring to be drawn in mini icicle
  handleMiniIcicleChange(newValue, selectedTreeName){
    console.log("in handleMiniIcicleChange App with value ", newValue, " selected Tree ", selectedTreeName);
    this.setState({miniIcicleShow: newValue, selectedMiniIcicleTreeName: selectedTreeName});
  } //end handleMiniIcicleChange function

  //Used for handling when an arc is selected in the chord diagram, or double click in mini chord to draw mini inta/inter
  handleMiniIntraChange(newValue){
    console.log("in handleMiniIntraChange App with value ", newValue);
    this.setState({miniIntraShow: newValue});
  } //end handleMiniIntraChange function

  // Used for handling when a new tree is selected form double click on arrow ring to draw in main area and update minis
  handleRingDblClickChange(newValue){
    console.log("in handleRingDblClickChange App with value ", newValue);
    this.setState({selectedTreeName: newValue});
  } //ed handleRingDblClickChange function

  // Used for handling when EdgeNames Dropdown for intra view changes
  handleEdgeNamesIntraFilterChange(newValue){
    console.log("in handleEdgeNamesIntraFilterChange App with value ", newValue);
    this.setState({selectedEdgeNamesIntraFilter: newValue});
  } // end handleEdgeNamesIntraFilterChange function

  // Used for handling when NodeNames Dropdown for intra view changes
  handleNodeNamesIntraFilterChange(newValue){
    console.log("in handleNodeNamesIntraFilterChange App with value ", newValue);
    this.setState({selectedNodeNamesIntraFilter: newValue});
  } //end handleNodeNamesIntraFilterChange function

  // Used for handling when Direction Dropdown for intra view changes
  handleDirectionIntraFilterChange(newValue){
    console.log("in handleDirectionIntraFilterChange App with value ", newValue);
    this.setState({selectedDirectionIntraFilter: newValue});
  } //end handleDirectionIntraFilterChange function

  // Used for handling when NodeTypes Dropdown for intra view changes
  handleNodeTypesIntraFilterChange(newValue){
    console.log("in handleNodeTypesIntraFilterChange App with value ", newValue);
    this.setState({selectedNodeTypesIntraFilter: newValue});
  } //end handleNodeTypesIntraFilterChange function

  // Used for handling when EdgeNames Dropdown for inter view changes
  handleEdgeNamesInterFilterChange(newValue){
    console.log("in handleEdgeNamesInterFilterChange App with value ", newValue);
    this.setState({selectedEdgeNamesInterFilter: newValue});
  } //end handleEdgeNamesInterFilterChange function

  // Used for handling when NodeNames Dropdown for inter view changes
  handleNodeNamesInterFilterChange(newValue){
    console.log("in handleNodeNamesInterFilterChange App with value ", newValue);
    this.setState({selectedNodeNamesInterFilter: newValue});
  } //end handleNodeNamesInterFilterChange function

  // Used for handling when NodeTypes Dropdown for inter view changes
  handleNodeTypesInterFilterChange(newValue){
    console.log("in handleNodeTypesInterFilterChange App with value ", newValue);
    this.setState({selectedNodeTypesInterFilter: newValue});
  } //end handleNodeTypesInterFilterChange function

  // Used for handling when Direction Dropdown for inter view changes
  handleDirectionInterFilterChange(newValue){
    console.log("in handleDirectionInterFilterChange App with value ", newValue);
    this.setState({selectedDirectionInterFilter: newValue});
  } //end handleDirectionInterFilterChange function

  // Used for handling when EdgeType Dropdown for main area cicle changes
  handleEdgeTypeSelect(e){
    console.log("in handleEdgeTypeSelect with input ", e)
    if(this.state.selectedEdgeType !== e){
      this.setState({selectedEdgeType: e});
    }//end if
  } //end handleEdgeTypeSelect function

  // Used for handling when TreeType Dropdown for chord changes
  handleChordDiagramTreeTypeFilter(newValues){
    console.log("in handleChordDiagramTreeTypeFilter with input ", newValues);
    this.setState({chordDiagramSelectedTreeType: newValues});
  } //end handleChordDiagramTreeTypeFilter function

  // Used for handling when TreeName Dropdown for chord changes
  handleChordDiagramTreeNameFilter(newValues){
    console.log("in handleChordDiagramTreeNameFilter with input ", newValues);
    this.setState({chordDiagramSelectedTreeName: newValues});
  } //end handleChordDiagramTreeNameFilter function

  // Traverses through given tree (node) gets the type of each node
  traverse( node){
    let types = [];

    if(node.children != null){
      // Current node has children
      if(node.type != null){
        types.push(node.type)
      }//end if

      //For every child traverse
      for(let c = 0; c < node.children.length; c++){
        let typesReturned = this.traverse( node.children[c]);

        //For every type returned add to the types array
        for(let t = 0; t < typesReturned.length; t++){
          types.push(typesReturned[t]);
        }//end for loop
      } //end for loop

      return types;
    }else{
      // Current node does not have children
      types.push(node.type);
      return types;
    }//end else
  } //end traverse function


  render(){
    //TODO: get rid of data variable after fix gray in mini chord
    const data = [
      [0,13,3,3,0,0,0,2,4],
      [3,0,5,0,0,0,0,0,0],
      [8,5,2,6,0,0,4,0,0],
      [9,0,8,0,9,0,0,0,0],
      [0,0,0,9,0,8,0,0,0],
      [0,0,0,0,9,0,7,8,0],
      [0,0,9,0,0,7,0,7,0],
      [3,0,0,0,0,8,6,0,7],
      [5,0,0,0,0,0,0,9,3]
    ];

  
    console.log("in app render");

    return (
      <Container fluid>
        <Row>
          <Col className="colContainer" md={3}>
            <Row>
              <Col className="mini" >
                <p id="mini1Title">Overview</p>
                <MiniChordDiagram 
                  miniChordShow={this.state.miniChordShow} 
                  data={data} 
                  networkData={this.state.networkData}
                  selectedTreeName={this.state.selectedTreeName} 
                  handleMiniChordChange={this.handleMainAreaChange}
                  handleEdgeTypeSelect={this.handleEdgeTypeSelect}
                  handleMiniIntraChange={this.handleMiniIntraChange}
                  handleMiniIcicleChange= {this.handleMiniIcicleChange} 
                ></MiniChordDiagram>
               </Col>
            </Row>
            <Row>
              <Col className="mini" id="miniHierarchy">
                <p id="mini1Title">Hierarchy</p>
                <MiniIcicleDiagram 
                  miniIcicleShow={this.state.miniIcicleShow}
                  selectedMiniIcicleTreeName={this.state.selectedMiniIcicleTreeName}
                  treeData={this.state.treesData}
                  uniqueNodeTypesAllTrees={this.state.uniqueNodeTypesAllTrees}
                  treesInterData={this.state.treesInterData}
                  selectedTreeName={this.state.selectedTreeName}
                  selectedEdgeType={this.state.selectedEdgeType}
                  treeIntraData={this.state.treesIntraData}
                  selectedEdgeNamesInterFilter = {this.state.selectedEdgeNamesInterFilter}
                  selectedNodeNamesInterFilter = {this.state.selectedNodeNamesInterFilter}
                  selectedNodeTypesInterFilter = {this.state.selectedNodeTypesInterFilter}
                  selectedDirectionInterFilter = {this.state.selectedDirectionInterFilter}
                ></MiniIcicleDiagram>
              </Col>
            </Row>
            <Row>
              <Col className="mini3">
                <p id="mini1Title">Intra Dependencies</p>
                <MiniIntraDiagram 
                  miniIntraShow={this.state.miniIntraShow}
                  treesIntraData={this.state.treesIntraData}
                  uniqueNodeTypesAllTrees={this.state.uniqueNodeTypesAllTrees}
                  selectedTreeName={this.state.selectedTreeName}
                  selectedEdgeNamesIntraFilter={this.state.selectedEdgeNamesIntraFilter}
                  selectedNodeNamesIntraFilter={this.state.selectedNodeNamesIntraFilter}
                  selectedDirectionIntraFilter = {this.state.selectedDirectionIntraFilter}
                  selectedNodeTypesIntraFilter= {this.state.selectedNodeTypesIntraFilter}
                ></MiniIntraDiagram>
              </Col>
            </Row>
            <Row>
              <Col className="miniLast">
                <p id="mini1Title">Inter Dependencies</p>
                <MiniInterDiagram 
                  miniInterShow={this.state.miniIntraShow}
                  treesInterData={this.state.treesInterData}
                  uniqueNodeTypesAllTrees={this.state.uniqueNodeTypesAllTrees}
                  selectedTreeName={this.state.selectedTreeName}
                  selectedEdgeNamesInterFilter = {this.state.selectedEdgeNamesInterFilter}
                  selectedNodeNamesInterFilter = {this.state.selectedNodeNamesInterFilter}
                  selectedNodeTypesInterFilter = {this.state.selectedNodeTypesInterFilter}
                  selectedDirectionInterFilter = {this.state.selectedDirectionInterFilter}
                ></MiniInterDiagram>
              </Col>
            </Row>
          </Col>
          <Col className="rightSide" md={9}>
            <Row>
                <Col className="toolBar" id="myToolBarContainer">
                  <ToolBarFeatures
                    isChordDiagram={!(this.state.miniChordShow)}
                    handleChordDiagramTreeTypeFilter={this.handleChordDiagramTreeTypeFilter}
                    handleChordDiagramTreeNameFilter={this.handleChordDiagramTreeNameFilter}
                    handleEdgeTypeSelect = {this.handleEdgeTypeSelect}
                    selectedTreeName={this.state.selectedTreeName} 
                    treeData={this.state.treesData}
                    treeIntraData={this.state.treesIntraData}
                    treeInterData = {this.state.treesInterData}
                    selectedEdgeType={this.state.selectedEdgeType}
                    handleEdgeNamesIntraFilterChange = {this.handleEdgeNamesIntraFilterChange}
                    handleNodeNamesIntraFilterChange = {this.handleNodeNamesIntraFilterChange}
                    handleDirectionIntraFilterChange = {this.handleDirectionIntraFilterChange}
                    handleNodeTypesIntraFilterChange = {this.handleNodeTypesIntraFilterChange}
                    handleEdgeNamesInterFilterChange = {this.handleEdgeNamesInterFilterChange}
                    handleNodeNamesInterFilterChange = {this.handleNodeNamesInterFilterChange}
                    handleNodeTypesInterFilterChange = {this.handleNodeTypesInterFilterChange}
                    handleDirectionInterFilterChange = {this.handleDirectionInterFilterChange}
                    networkData = {this.state.networkData}
                  ></ToolBarFeatures>
                </Col>
            </Row>
            <Row>
              <Col className="mainArea">
                <MainArea 
                  data={data} 
                  networkData = {this.state.networkData}
                  isChordDiagram={!(this.state.miniChordShow)} 
                  selectedTreeName={this.state.selectedTreeName} 
                  treeData={this.state.treesData} 
                  id='myMainArea' 
                  handleMiniChordChange={this.handleMainAreaChange}
                  uniqueNodeTypesAllTrees={this.state.uniqueNodeTypesAllTrees}
                  selectedEdgeType={this.state.selectedEdgeType}
                  treeIntraData={this.state.treesIntraData}
                  handleEdgeTypeSelect={this.handleEdgeTypeSelect}
                  treesInterData={this.state.treesInterData}
                  handleMiniIcicleChange={this.handleMiniIcicleChange}
                  handleMiniIntraChange={this.handleMiniIntraChange}
                  chordDiagramSelectedTreeType={this.state.chordDiagramSelectedTreeType}
                  chordDiagramSelectedTreeName={this.state.chordDiagramSelectedTreeName}
                  selectedEdgeNamesIntraFilter={this.state.selectedEdgeNamesIntraFilter}
                  selectedNodeNamesIntraFilter={this.state.selectedNodeNamesIntraFilter}
                  selectedDirectionIntraFilter = {this.state.selectedDirectionIntraFilter}
                  selectedNodeTypesIntraFilter= {this.state.selectedNodeTypesIntraFilter}
                  selectedEdgeNamesInterFilter = {this.state.selectedEdgeNamesInterFilter}
                  selectedNodeNamesInterFilter = {this.state.selectedNodeNamesInterFilter}
                  selectedNodeTypesInterFilter = {this.state.selectedNodeTypesInterFilter}
                  selectedDirectionInterFilter = {this.state.selectedDirectionInterFilter}
                  selectedMiniIcicleTreeName={this.state.selectedMiniIcicleTreeName}
                  handleRingDblClickChange = {this.handleRingDblClickChange}
                  handleChordDiagramTreeTypeFilter={this.handleChordDiagramTreeTypeFilter}
                  handleChordDiagramTreeNameFilter={this.handleChordDiagramTreeNameFilter}
                ></MainArea>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default App;