import React from 'react';
import "./Widget.css";
import {  TwitterTimelineEmbed } from 'react-twitter-embed';


export default function Widget() {
  return (
    <div className='widget' >

     <div  className='widget_widgetcontainer'>
         <h2>What's happening</h2>
         <TwitterTimelineEmbed 
         sourceType='profile'
         screenName='TechCrunch'
         options={{height:400}}
         />
     </div>
    </div>
  )
}
