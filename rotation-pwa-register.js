(()=>{
 if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register('./rotation-sw.js',{scope:'./'}).catch(error=>console.warn('ROTATION offline cache unavailable:',error));
 },{once:true});
})();
