// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

/* Don't Pollute the Global  Scope */

function createDataObject(){
  var quarterCommitCount = new Map();
  var langRepoCount = new Map();
  var langStarCount = new Map();
  var langCommitCount = new Map();
  var repoCommitCount = new Map();
  var repoStarCount = new Map();
  var repoCommitCountDescriptions = new Map();
  var repoStarCountDescriptions = new Map();
  var user;
  var dataObject ={
    getQuarterCommitCount:function(){
      return quarterCommitCount;
    },
    setQuarterCommitCount:function(quarterCommitCountMap){
      quarterCommitCount = quarterCommitCountMap;
    },
    getLangRepoCount:function(){
      return langRepoCount;
    },
    setLangRepoCount:function(langRepoCountMap){
      langRepoCount = langRepoCountMap;
    },
    getLangStarCount:function(){
      return langStarCount;
    },
    setLangStarCount: function(langStarCountMap){
      langStarCount = langStarCountMap;
    },
    getLangCommitCount:function(){
      return langCommitCount;
    },
    setLangCommitCount:function(langCommitCountMap){
       langCommitCount = langCommitCountMap;
    },
    getRepoCommitCount:function(){
      return repoCommitCount;
    },
    setRepoCommitCount:function(repoCommitCountMap){
      repoCommitCount = repoCommitCountMap;
    },
    getRepoStarCount:function(){
      return repoStarCount;
    },
    setRepoStarCount: function(repoStarCountMap){
      repoStarCount = repoStarCountMap;
    },
    getRepoCommitCountDescriptions:function(){
      return repoCommitCountDescriptions;
    },
    setRepoCommitCountDescriptions: function(repoCommitCountDescriptionsMap){
      repoCommitCountDescriptions = repoCommitCountDescriptionsMap;
    },
    getRepoStarCountDescriptions:function(){
      return repoStarCountDescriptions;
    },
    setRepoStarCountDescriptions:function(repoStarCountDescriptionsMap){
      repoStarCountDescriptions = repoStarCountDescriptionsMap
    },
    getUser:function(){
      return user;
    },
    setUser:function(userObj){
      user = userObj;
    }

  };
  return dataObject;
}


function getUserInfo(userName, data) {

  var progressDiv = document.querySelector('.progress');
  var indicatorDiv = document.querySelector('#indicator');

  indicatorDiv.className = 'progress-bar progress-bar-striped bg-success';

  var url = 'https://api.github.com/users/' + userName;
  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    console.log('CORS not supported');
    return;
  }

  progressDiv.style.visibility = 'visible';
  indicatorDiv.style.width = '0%';
  indicatorDiv.innerHTML = '0%';
  xhr.onreadystatechange = function () {

    if (this.readyState == 1) {
      indicatorDiv.style.width = '25%';
      indicatorDiv.innerHTML = '25%';
    }
    if (this.readyState == 2) {
      indicatorDiv.style.width = '50%';
      indicatorDiv.innerHTML = '50%';
    }
    if (this.readyState == 3) {
      indicatorDiv.style.width = '75%';
      indicatorDiv.innerHTML = '75%';
    }
    if (this.readyState == 4 && this.status == 403) {
      var obj = JSON.parse(this.responseText);
      //console.log(obj);

      indicatorDiv.className = 'progress-bar progress-bar-striped bg-danger';
      setTimeout(() => progressDiv.style.visibility = 'hidden', 1000);
      document.getElementById('errMsg').innerHTML = obj.message;
      document.getElementById('errMsg').style.color = 'red';
    }
    if (this.readyState == 4 && this.status == 404) {
      var response = JSON.parse(this.responseText);
      //console.log(response.message);
      indicatorDiv.className = 'progress-bar progress-bar-striped bg-danger';
      setTimeout(() => progressDiv.style.visibility = 'hidden', 1000);
      document.getElementById('errMsg').innerHTML = response.message;
      document.getElementById('errMsg').style.color = 'red';
    }
    if (this.readyState == 4 && this.status == 200) {
       data.setUser(JSON.parse(this.responseText));
       //console.log(data.getUser());
      document.getElementById('profileImage').src = data.getUser().avatar_url;
      document.getElementById('profileImage').alt = data.getUser().name;
      document.getElementById('bio').innerHTML = data.getUser().bio;
     
      var then = new Date(data.getUser().created_at);

      var today = new Date();
      var lastQuarter = today.getFullYear() + '-Q' + (Math.ceil((today.getMonth() + 1) / 3));
     
      //console.log(lastQuarter);
      for (var i = then.getFullYear(); i <= today.getFullYear(); i++) {
        for (var j = 1; j <= 4; j++) {
          var quarter = i + '-Q' + j;
          data.getQuarterCommitCount().set(quarter, 0);
          if (quarter == lastQuarter) break;
        }

      }
      //console.log(data.getQuarterCommitCount());
      calculateQuarterCommitCount(data);
      //console.log(quarterCommitCount);
     
    }

  }

  // Handle network errors
  req.onerror = function() {
      indicatorDiv.className = 'progress-bar progress-bar-striped bg-danger';
      setTimeout(() => progressDiv.style.visibility = 'hidden', 1000);
      document.getElementById('errMsg').innerHTML = 'Network Error';
      document.getElementById('errMsg').style.color = 'red';
  };


  xhr.send();
}

function buildUserDetails(user) {
  var then = new Date(user.created_at);

  var today = new Date();
  var year = Math.floor((today - then) / 31536000000);
  var output = `<ul class="list-group list-group-flush">
                    <li class="list-group-item"><i class="fa fa-fw fa-user"></i> ${user.login} <p><small>( ${user.name ? user.name : ''} )</small></p>  </li>
                    <li class="list-group-item"><i class="fa fa-fw fa-database"></i> ${user.public_repos} public repos <p><small>(Own Repos- ${user.ownRepos?user.ownRepos:'0'}, Forked- ${user.forkedRepos})</small></p> </li>
                    <li class="list-group-item"><i class="fa fa-fw fa-clock-o"></i>Joined GitHub ${year} Year Ago  </li>
                    <li class="list-group-item"><i class="fa fa-fw fa-envelope"></i> ${user.email ? user.email : ''}  </li>
                    <li class="list-group-item"><i class="fa fa-fw fa-external-link"></i> <a href="${user.html_url}" target="_blank">View Profile On GitHub</a>   </li>
                    </ul>`;
  document.getElementById('userDetail').innerHTML = output;
}




function calculateQuarterCommitCount(data) {
  var url = 'https://api.github.com/users/' + data.getUser().login + '/repos?per_page=1000';
  var xhr = createCORSRequest('GET', url);

  if (!xhr) {
    console.log('CORS not supported');
    return;
  }

  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var repos = JSON.parse(this.responseText);
      //console.log('All repos-' + repos.length);

      const unforkRepo = repos.filter(repo => {
        return repo.fork === false && repo.size !== 0
      })
      //console.log('Own Repos -' + unforkRepo.length);
      data.getUser().ownRepos= unforkRepo.length;
      data.getUser().forkedRepos= repos.length - unforkRepo.length;
      unforkRepo.forEach((myRepo,index, repoArray) => {
        
        data.getLangRepoCount().set(myRepo.language,(data.getLangRepoCount().get(myRepo.language) ?  data.getLangRepoCount().get(myRepo.language) :0) +1);
        data.getLangStarCount().set(myRepo.language,(data.getLangStarCount().get(myRepo.language) ?  data.getLangStarCount().get(myRepo.language) :0) +myRepo.watchers_count);

        data.getRepoStarCount().set(myRepo.name,(data.getRepoStarCount().get(myRepo.name) ?  data.getRepoStarCount().get(myRepo.name) :0) +myRepo.watchers_count);
        data.getRepoStarCountDescriptions().set(myRepo.name,myRepo.description ? myRepo.description:'Description Not Found' );
        //console.log(myRepo.commits_url.replace('{/sha}',''))
        makeCORSRequestForCommitCount(myRepo.commits_url.replace('{/sha}', ''),index, repoArray,data);
        
      })
      if(unforkRepo.length===0){
        buildUserDetails(data.getUser());
        createLineChart('quarterCommitCount',data);

        document.querySelector('#indicator').style.width = '100%';
        document.querySelector('#indicator').innerHTML = '100%';
        setTimeout(() => document.querySelector('.progress').style.visibility = 'hidden', 1000);
      }
      
    }
  }
  // Handle network errors
  req.onerror = function() {
    indicatorDiv.className = 'progress-bar progress-bar-striped bg-danger';
    setTimeout(() => progressDiv.style.visibility = 'hidden', 1000);
    document.getElementById('errMsg').innerHTML = 'Network Error';
    document.getElementById('errMsg').style.color = 'red';
  };
  xhr.send();
}

var i=0;
function makeCORSRequestForCommitCount(url,index, repoArray,data) {
  var xhr = createCORSRequest('GET', url);
  
  if (!xhr) {
    console.log('CORS not supported');
    return;
  }
  xhr.onreadystatechange = function () {
   
    if (this.readyState == 4 && this.status == 200) {
      var commits = JSON.parse(this.responseText);
      i++;
      
      // console.log(commits);

      commits.forEach(commit => {

        var commitDate = new Date(commit.commit.committer.date);
        var commitQuarter = commitDate.getFullYear() + '-Q' + (Math.ceil((commitDate.getMonth() + 1) / 3));
        data.getQuarterCommitCount().set(commitQuarter, data.getQuarterCommitCount().get(commitQuarter) + 1);

        data.getLangCommitCount().set(repoArray[index].language,(data.getLangCommitCount().get(repoArray[index].language) ?  data.getLangCommitCount().get(repoArray[index].language) :0) +1);

        data.getRepoCommitCount().set(repoArray[index].name,(data.getRepoCommitCount().get(repoArray[index].name) ?  data.getRepoCommitCount().get(repoArray[index].name) :0) +1);
        data.getRepoCommitCountDescriptions().set(repoArray[index].name,repoArray[index].description? repoArray[index].description:'Description Not Found' );
      
      })
     // console.log('i-'+i+' length-'+repoArray.length);
      if(i===repoArray.length){
        buildUserDetails(data.getUser());
        createLineChart('quarterCommitCount',data);
        createDoughnutChart('langRepoCount',data);
       
        for (let value of data.getLangStarCount().values()) {
          if(value){
            let output = `<div id="langStarCountDiv" class="col-xs-12 col-sm-12 col-md-12 col-lg-4">
            <h4 class="text-center">Star per Language </h4>
            <canvas id="langStarCount"></canvas>
        </div>`;
            document.getElementById('langRepoCountDiv').className = 'col-xs-12 col-sm-12 col-md-12 col-lg-4';
            document.getElementById('langCommitCountDiv').className = 'col-xs-12 col-sm-12 col-md-12 col-lg-4';
            
            let targetDiv=document.getElementById('langRepoCountDiv')
            var divToAppend = document.createRange().createContextualFragment(output);
            targetDiv.parentNode.insertBefore(divToAppend, targetDiv.nextSibling)
            createDoughnutChart('langStarCount',data);
            
            break;
          }
        }
        for (let value of data.getLangCommitCount().values()) {
          if(value){
            createDoughnutChart('langCommitCount',data);
            break;
          }
        }

        for (let value of data.getRepoCommitCount().values()) {
          if(value){
            var top10SortedRepoCommitCount = new Map([...data.getRepoCommitCount().entries()].sort((a, b) => b[1] - a[1]));
            var top10SortedRepoCommitCountDescription = new Map();
            var j= 0;
            top10SortedRepoCommitCount.forEach(function(value,key,map){
              j++;
              if(j>10){
                map.delete(key);
              }
              if(value===0){
                map.delete(key);
              }
            })
           // console.log(top10SortedRepoCommitCount);
            top10SortedRepoCommitCount.forEach(function(value,key,map){
              top10SortedRepoCommitCountDescription.set(key,data.getRepoCommitCountDescriptions().get(key));
           })
           data.setRepoCommitCountDescriptions(top10SortedRepoCommitCountDescription);
           data.setRepoCommitCount(top10SortedRepoCommitCount);
           //console.log(repoCommitCountDescriptions);
            createDoughnutChart('repoCommitCount',data);
            break;
          }
        }

        
        for (let value of data.getRepoStarCount().values()) {
          if(value){
            let output =`<div id="repoStarCountDiv"  class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
            <h4 class="text-center">Stars per Repo (top 10)</h4>
            <canvas id="repoStarCount"></canvas>
        </div>`;
        document.getElementById('repoCommitCountDiv').className = 'col-xs-12 col-sm-12 col-md-6 col-lg-6';
        
        
        
        let targetDiv=document.getElementById('repoCommitCountDiv')
        var divToAppend = document.createRange().createContextualFragment(output);
        targetDiv.parentNode.insertBefore(divToAppend, targetDiv.nextSibling)

             var top10SortedRepoStarCount = new Map([...data.getRepoStarCount().entries()].sort((a, b) => b[1] - a[1]));
              var top10SortedRepoStarCountDescription = new Map();
            var j= 0;
            top10SortedRepoStarCount.forEach(function(value,key,map){
              j++;
              if(j>10){
                map.delete(key);
              }
              if(value===0){
                map.delete(key);
              }
            })
           // console.log(top10SortedRepoStarCount);
             top10SortedRepoStarCount.forEach(function(value,key,map){
                top10SortedRepoStarCountDescription.set(key,data.getRepoStarCountDescriptions().get(key));
             })
             data.setRepoStarCountDescriptions(top10SortedRepoStarCountDescription);
             data.setRepoStarCount(top10SortedRepoStarCount);
            // console.log(repoStarCountDescriptions);
            createDoughnutChart('repoStarCount',data);
            break;
          }
        } 

        setShareButtonHref(data.getUser());
         
        document.querySelector('#indicator').style.width = '100%';
        document.querySelector('#indicator').innerHTML = '100%';
        setTimeout(() => document.querySelector('.progress').style.visibility = 'hidden', 1000);
     
      }
      
    }
  }
  // Handle network errors
  req.onerror = function() {
    indicatorDiv.className = 'progress-bar progress-bar-striped bg-danger';
    setTimeout(() => progressDiv.style.visibility = 'hidden', 1000);
    document.getElementById('errMsg').innerHTML = 'Network Error';
    document.getElementById('errMsg').style.color = 'red';
  };
  xhr.send();

}


function setShareButtonHref(user){
  let profileUrl  = "https://alamnr.github.io/profile.html?user=" + user.login;
  let shareText = user.login + "'s GitHub profile - Visualized:";
  let twitterUrl = "https://twitter.com/intent/tweet?url=" + profileUrl + "&text=" + shareText + "&via=javascript&related=scope_closer";
  let facebookUrl = "https://facebook.com/sharer.php?u=" + profileUrl + "&quote=" + shareText;
  document.getElementById('twitter').href=twitterUrl;
  document.getElementById('facebook').href=facebookUrl;
  //console.log(twitterUrl);
  //console.log(facebookUrl);
}



