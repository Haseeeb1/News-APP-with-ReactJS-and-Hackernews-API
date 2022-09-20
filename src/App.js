
import './App.css';
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes, { node } from 'prop-types';
import { sortBy } from 'lodash';
import Widget from './Widget';


const DEFAULT_QUERY = 'latest';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE='page=';
const DEFAULT_HPP = '6';
const PARAM_HPP = 'hitsPerPage=';
const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
  };

class App extends Component {
  _isMounted=false;
  constructor(props) {
    super(props);

    this.state = {
      results:null,
      searchKey:'',
      searchTerm: DEFAULT_QUERY,
      error:null,
      isLoading:false,
      sortKey:'NONE'
    };

     this.needsToSearchTopStories=this.needsToSearchTopStories.bind(this);
     this.setSearchTopStories=this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit=this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories=this.fetchSearchTopStories.bind(this);
    this.onSort=this.onSort.bind(this);
  }

  onSort(sortKey){
    this.setState({sortKey});
  }


 
  fetchSearchTopStories(searchTerm,page=0){
      this.setState({isLoading:true});

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}\
${page}&${PARAM_HPP}${DEFAULT_HPP}`)
.then(result =>this._isMounted && this.setSearchTopStories(result.data))
.catch(error => this._isMounted && this.setState({ error }));
/*const url= `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}
${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
console.log(url);*/
  }
 
  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm];
  }

  onSearchSubmit(event){
    const { searchTerm } = this.state;
    this.setState({searchKey:searchTerm});

    if(this.needsToSearchTopStories(searchTerm)){
    this.fetchSearchTopStories(searchTerm,0);
    }
    event.preventDefault();
  }

   setSearchTopStories(result){

     const{hits,page}=result;
     const{searchKey,results}=this.state;
    // const oldHits=results&&results[searchKey]?results[searchKey].hits :[];

     const updatedHits=[...hits];

    this.setState({results:{[searchKey]: {hits: updatedHits,page}},isLoading:false});
   }
   
   componentDidMount(){
    this._isMounted=true;
    const{searchTerm}=this.state;
    this.setState({searchKey:searchTerm});
    this.fetchSearchTopStories(searchTerm,0);
     }

     componentWillUnmount(){
      this._isMounted=false;
     }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits =hits.filter(isNotId);
    this.setState({ 
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
        }
    });
  }

  render() {
    const { searchTerm, results,searchKey ,error,isLoading,sortKey} = this.state;
    const page = (results&& results[searchKey] && results[searchKey].page) || 0;
    const list=(results&& results[searchKey] && results[searchKey].hits) || [];
    

    return (
     
      <div className="page">
         <div className='Heading'><h1>
          NEWS-CASTER<span>
                 Stay Updated</span>
            </h1>
            </div>
        <div className="interactions">
          <Search
            value={searchTerm}
            onClick={() => this.fetchSearchTopStories(searchKey,0)}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
       <div className='biggest'>
        <div className='second'>
       {error ?
      <div>
          <p>Something Went wrong.</p>
          <p> Try again or check your Internet connection</p>
       </div>
    :
        <Table
          list={list}
          sortKey={sortKey}
          onSort={this.onSort}
          onDismiss={this.onDismiss}
        />
       }

        <div className="interactions1">
     {isLoading ? <Loading/>:
     <div className='nextdiv'>
     <Button className='nextbutton'
       onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
            NEXT
        </Button>
        </div>
  }
  </div>
  </div>
<div className='third'>
  <Widget/>
</div>
</div>
  </div>
  
    );
  }
}

const Loading=()=><div className='loadingdiv'><h1>
<span className="let1">L</span>  
<span className="let2">O</span>  
<span className="let3">A</span>  
<span className="let4">D</span>  
<span className="let5">I</span>  
<span className="let6">N</span>  
<span className="let7">G...</span>  
</h1></div>;


const Search = ({ value, onChange,onClick, onSubmit,children }) =>{
  let input;
 return(
 <form className='form' onSubmit={onSubmit}>
    <input className="input-field"
      type="text"
      value={value}
      onChange={onChange}

      ref={(node)=>input=node}
    />
    <button type="submit" 
    onClick={onClick}>
      {children}
    </button>
  </form>
  );
}



const Table = ({ list,sortKey,onSort, onDismiss }) =>
  <div className="table">
    <div className='table-header'>
      <h1 className='sorthead'>SORT BY:</h1>
      <span className='button'>
      <Sort
       sortKey={'TITLE'}
        onSort={onSort}>
          Title</Sort>
      </span>
<span  className='button'>
<Sort
sortKey={'AUTHOR'}
onSort={onSort}
>
Author
</Sort>
</span>
<span  className='button'>
<Sort
sortKey={'COMMENTS'}
onSort={onSort}
>
Comments
</Sort>
</span>
<span  className='button'>
<Sort
sortKey={'POINTS'}
onSort={onSort}
>
Points
</Sort>
</span>
    </div>
    {SORTS[sortKey](list).map(item =>
      <div key={item.objectID} className="table-row">
        <span className='titlespan' >
          <a href={item.url}>{item.title}</a>
        </span>
        <div className='secondline'>
        <span  >
       <span className='title1'> Author :</span> {item.author}  |
        </span>
        <span className='compadding'>
        <span className='title1'>Comments :  </span>{item.num_comments} |
        </span>
        <span className='pointpadding' >
       <span className='title1'> Points : </span> {item.points} 
        </span>
     
        <span >
          <Button 
            onClick={() => onDismiss(item.objectID)}
            className="button-inline"
          >
            Dismiss
          </Button>
        </span>
        </div>
      </div>
    )}
  </div>;

Table.propTypes={
  list: PropTypes.array.isRequired,
  onDismiss:PropTypes.func.isRequired,
};

const Sort=({sortKey,onSort,children})=>
<Button className='sortbutton'
 onClick={()=>onSort(sortKey)}
 >{children}
</Button>;

const Button = ({ onClick,className = '', children,}) =>
  <button
    onClick={onClick}
    className={className}
    type="button"
  >
    {children}
  </button>;

Button.propTypes={
  onClick: PropTypes.func.isRequired,
  className:PropTypes.string,
  children:PropTypes.node.isRequired,
};


export default App;
export{Button,Search,Table};