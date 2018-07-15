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


function get(url) {


  var requestPromise = new Promise((resolve, reject) => {
    var req = createCORSRequest('GET', url);
    req.onload = () => {
      if (req.status == 200) {
        //resolve(req.response);
        //console.log(req.getResponseHeader('Link'));
        if (req.getResponseHeader('Link')) {
          resolve(JSON.stringify({
            linkData: req.getResponseHeader('Link'),
            data: JSON.parse(req.response)
          }));
        } else {
          if (url.includes('repos') || url.includes('commits') || url.includes('following') || url.includes('followers')) {
            resolve(JSON.stringify({
              data: JSON.parse(req.response)
            }));
          } else {
            resolve(req.response);
          }

        }
      } else {
        reject(Error(req.statusText));
      }
    };
    // Handle network error
    req.onerror = () => {
      document.querySelector('#modal .animationload').style.display = 'none';
       document.getElementById('errMsg').innerHTML = 'Error: Network Error.';
       document.getElementById('errMsg').style.color = 'red';
      reject(Error('Network Error'));


    }
    req.send();
  });
  return Promise.all([requestPromise], results => {
    return results[0];
  });

}

function getJSON(url) {
  return get(url).then(JSON.parse)
}

function getFollow_ing_ers(url, follow_ing_ers) {
  //console.log('repo url-',url);
  return getJSON(url).then(response => {
    //console.log(response);
    var obj = {};

    if (!follow_ing_ers) {
      follow_ing_ers = [];
    }
    follow_ing_ers = follow_ing_ers.concat(response.data);
    obj.followArray = follow_ing_ers;
    //console.log(follow_ing_ers.length + " follow_ing_ers so far");
    //console.log("repos- ",response);
    /*
    if (response.linkData) {
      if (parse_link_header(response.linkData).next) {

        //console.log("There is more.");

        let next = parse_link_header(response.linkData).next;
        //console.log('next - ',next);
        return getFollow_ing_ers(next, follow_ing_ers);
      }
    }
    */

    if (response.linkData) {
      obj.prev =  parse_link_header(response.linkData).prev;
      obj.next =  parse_link_header(response.linkData).next;
      obj.last = parse_link_header(response.linkData).last;
      obj.first = parse_link_header(response.linkData).first;
    }

    //console.log('Repo Array - ',repos);

    //return follow_ing_ers;
    return obj;


  }).catch(err => console.log(err));
}

function getUserRepos(url, repos) {
  //console.log('repo url-',url);
  return getJSON(url).then(response => {
    //console.log(response);
    if (!repos) {
      repos = [];
    }
    repos = repos.concat(response.data);
    console.log(repos.length + " repos so far");
    //console.log("repos- ",response);
    if (response.linkData) {
      if (parse_link_header(response.linkData).next) {

        //console.log("There is more.");

        let next = parse_link_header(response.linkData).next;
        //console.log('next - ',next);
        return getUserRepos(next, repos);
      }
    }


    //console.log('Repo Array - ',repos);

    return repos;


  }).catch(err => console.log(err));
}

function getUserInfo(userName, dataObj) {

  var progressDiv = document.querySelector('.progress');
  var indicatorDiv = document.querySelector('#indicator');

  indicatorDiv.className = 'progress-bar progress-bar-striped progress-bar-animated bg-success';
  progressDiv.style.visibility = 'visible';
  indicatorDiv.style.width = '0%';
  indicatorDiv.innerHTML = '0% wait...';

  getJSON('https://api.github.com/users/' + userName + '?client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea')
    .then(userData => {
      console.log(userData);
      console.log('Email-', userData.email);
      dataObj.setUser(userData);

      indicatorDiv.style.width = '10%';
      indicatorDiv.innerHTML = '10% wait...';




      let url = 'https://api.github.com/users/' + userData.login + '/repos?per_page=100&client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea';

      return getUserRepos(url);

      //console.log('Repo Array - ',repoArray);
    }).then((repos) => {
      console.log('All fetched repos-', repos);
      dataObj.setRepos(repos);


      // This code is done by following - https://developers.google.com/web/fundamentals/primers/promises#creating_a_sequence
      // and  - https://medium.com/adobetech/how-to-combine-rest-api-calls-with-javascript-promises-in-node-js-or-openwhisk-d96cbc10f299

      // Good (data fetch time is high) Optimised solution see link - https://developers.google.com/web/fundamentals/primers/promises#creating_a_sequence

      /*

           var sequence = Promise.resolve();

           dataObj.getRepos().filter(repo => {
            return repo.fork === false && repo.size !== 0
          }).forEach((repo,currentIndex,repoArray)=>{
            var indecatorValue = 50/repoArray.length;
              let url = repo.commits_url.replace('{/sha}', '')+'?per_page=100&client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea';

               sequence = sequence.then(()=>{
                return getCommitPerRepos(url,null,repo,dataObj);
               }).then(commits=>{
                console.log(repo.name+'-'+currentIndex,' - commits count - ',commits);
                indecatorValue*=currentIndex+1;
                indicatorDiv.style.width = Number.parseFloat( 50+indecatorValue).toFixed(2) + '%';
                indicatorDiv.innerHTML = Number.parseFloat( 50+indecatorValue).toFixed(2) + '% wait...';

                if(currentIndex === repoArray.length-1){
                  console.log('All Done-', dataObj.getCommitMap());
                   // All data fetching and mutating done now calculate the data for chart and generate chart
                calculateDataAndGenerateChart(dataObj);

              }
               });

            })
      */
      // Better  (data fetch time is medium)  Optimised solution see link - https://developers.google.com/web/fundamentals/primers/promises#creating_a_sequence

      /*
      dataObj.getRepos().filter(repo => {
        return repo.fork === false && repo.size !== 0
      }).reduce((sequence,repo,currentIndex,repoArray)=>{
        var indecatorValue = 50/repoArray.length;
      let url = repo.commits_url.replace('{/sha}', '')+'?per_page=100&client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea';
      return sequence.then(()=>{
        return getCommitPerRepos(url,null,repo,dataObj);
      }).then(commits=>{
        console.log(repo.name+'-'+currentIndex,' - commits count - ',commits);
        //dataObj.getCommitMap().set(repo,commits);

        indecatorValue*=currentIndex+1;
        indicatorDiv.style.width = Number.parseFloat( 50+indecatorValue).toFixed(2) + '%';
        indicatorDiv.innerHTML = Number.parseFloat( 50+indecatorValue).toFixed(2) + '% wait...';

        if(currentIndex === repoArray.length-1){
          console.log('All Done-', dataObj.getCommitMap());
          //indicatorDiv.style.width = '75%';
          //indicatorDiv.innerHTML = '75% wait...';
          // All data fetching and mutating done now calculate the data for chart and generate chart
          calculateDataAndGenerateChart(dataObj);

        }
      });
    },Promise.resolve());
    */



      //  Best (data fetch time is low) Optimised solution see link - https://developers.google.com/web/fundamentals/primers/promises#creating_a_sequence

      dataObj.getRepos().filter(repo => {
        return repo.fork === false && repo.size !== 0
      }).map((repo) => {
        let url = repo.commits_url.replace('{/sha}', '') + '?per_page=100&client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea';
        return getCommitPerRepos(url, null, repo, dataObj);
      }).reduce((sequence, commitPromise, currentIndex, repoArray) => {
        var indecatorValue = 50 / repoArray.length;
        return sequence.then(() => {
          return commitPromise;
        }).then(commits => {
          // console.log(currentIndex, ' - commits count - ', commits);

          indecatorValue *= currentIndex + 1;
          indicatorDiv.style.width = Number.parseFloat(10 + indecatorValue).toFixed(2) + '%';
          indicatorDiv.innerHTML = Number.parseFloat(10 + indecatorValue).toFixed(2) + '% wait...';

          if (currentIndex === repoArray.length - 1) {
            console.log('All Done-', dataObj.getCommitMap());
            fetchFollowing_n_Followers(dataObj);
            calculateDataAndGenerateChart(dataObj);
            checkRateLimit();
          }
        });
      }, Promise.resolve());


      if (dataObj.getRepos().filter(repo => {
          return repo.fork === false && repo.size !== 0
        }).length === 0) {
        fetchFollowing_n_Followers(dataObj);
        calculateDataAndGenerateChart(dataObj);
        checkRateLimit();
      }


    }).catch(err => {
      console.log(err)
      var indicatorDiv = document.querySelector('#indicator');
      indicatorDiv.className = 'progress-bar progress-bar-striped progress-bar-animated bg-danger';
      indicatorDiv.innerHTML = indicatorDiv.style.width + ' Opps, Error...';
      setTimeout(() => progressDiv.style.display = 'none', 1000);
       document.getElementById('errMsg').innerHTML = err;
       document.getElementById('errMsg').style.color = 'red';

    })
}

function fetchFollowing_n_Followers(dataObj){

        Promise.resolve().then(() => {

              return getFollow_ing_ers(dataObj.getUser().url + '/following?per_page=100&client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea');


          })
          .then(followingObj => {
            //console.log('All fetched following-', following);
            if(!followingObj.length){
              document.querySelector('#headingOne button').innerText = 'Following (0) ';
            }

            followingObj.followArray.map(obj => {
              return getJSON(obj.url+'?client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea');
            }).reduce((sequence, followingObjPromise, curIndex, followingArray) => {
              let indecatorValue = 20 / followingArray.length;
              return sequence.then(() => {
                return followingObjPromise;
              }).then(objData => {

                indecatorValue *= curIndex + 1;

                  document.querySelector('#indicator').style.width =  Number.parseFloat(60+ indecatorValue).toFixed(2) + '%';
                  document.querySelector('#indicator').innerHTML = Number.parseFloat(60 + indecatorValue).toFixed(2) + '% wait...';


                // console.log('obj data-', objData.bio)
                dataObj.getFollowing().push(objData);

                if (curIndex === followingArray.length - 1) {
                  console.log('All Done Following-', dataObj.getFollowing());
                  buildFollowing_card(dataObj.getFollowing(),followingObj);
                  document.querySelectorAll('.page-link').forEach(elem=>{elem.addEventListener('click',(e)=>{
                    e.preventDefault();
                    //console.log('clicked-',e.target.href);
                    loadPagingData(e.target.href);
                  })});

                }
              });
            }, Promise.resolve());

          });




        Promise.resolve().then(() => {

              return getFollow_ing_ers(dataObj.getUser().url + '/followers?per_page=100&client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea');

          })
          .then(followersObj => {
          //  console.log('All fetched followers-', followers);
          if(!followersObj.length){
            document.querySelector('#headingTwo button').innerText = 'Followers (0) ';
          }


            followersObj.followArray.map(obj => {
              return getJSON(obj.url+'?client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea');
            }).reduce((sequence, followersObjPromise, curIndex, followerArray) => {
              let indecatorValue = 20 / followerArray.length;
              return sequence.then(() => {
                return followersObjPromise;
              }).then(objData => {

                indecatorValue *= curIndex + 1;

                  document.querySelector('#indicator').style.width = Number.parseFloat(80 + indecatorValue).toFixed(2) + '%';
                  document.querySelector('#indicator').innerHTML = Number.parseFloat(80 + indecatorValue).toFixed(2) + '% wait...';


                //console.log('obj data-', objData.bio)
                dataObj.getFollowers().push(objData);
                if (curIndex === followerArray.length - 1) {
                  console.log('All Done Followers-', dataObj.getFollowers());
                  buildFollowers_card(dataObj.getFollowers(),followersObj);
                  document.querySelectorAll('.page-link').forEach(elem=>{elem.addEventListener('click',(e)=>{
                    e.preventDefault();

                    //console.log('clicked-',e.target.href);
                    loadPagingData(e.target.href);
                  })});

                }
              });
            }, Promise.resolve());
          });

}

function loadPagingData(url){
  document.querySelector('#modal .animationload').style.display = 'block';
  document.getElementById('errMsg').innerHTML='';
	var followArray=[];
  Promise.resolve().then(() => {

              return getFollow_ing_ers(url);

          })
          .then(followersObj => {


            followersObj.followArray.map(obj => {
              return getJSON(obj.url+'?client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea');
            }).reduce((sequence, followersObjPromise, curIndex, followerArray) => {

              return sequence.then(() => {
                return followersObjPromise;
              }).then(objData => {



                followArray.push(objData);
                if (curIndex === followerArray.length - 1) {
                  console.log('All Done Followers-', followArray);
				  if(url && url.indexOf('following') !==-1){
					buildFollowing_card(followArray,followersObj,url);
				  }
				  else{
					buildFollowers_card(followArray,followersObj,url);
				  }
          document.querySelector('#modal .animationload').style.display = 'none';

				  document.querySelectorAll('.page-link').forEach(elem=>{elem.addEventListener('click',(e)=>{
                    e.preventDefault();
                    //console.log('clicked-',e.target.href);
                    loadPagingData(e.target.href);
                  })});

                }
              });
            }, Promise.resolve());
          }).catch(err => {
            console.log(err)

          });
          checkRateLimit();
}

function buildUserDetails(user) {

  document.getElementById('profileImage').src = user.avatar_url;
  document.getElementById('profileImage').alt = user.name;
  document.getElementById('bio').innerHTML = user.bio;


  var then = new Date(user.created_at);

  var today = new Date();
  var year = Math.floor((today - then) / 31536000000);
  var output = `<ul class="list-group list-group-flush">
                    <li class="list-group-item"><i class="fa fa-fw fa-user"></i> ${user.login} <p><small>( ${user.name ? user.name : ''} )</small></p>  </li>
                    <li class="list-group-item"><i class="fa fa-fw fa-database"></i> ${user.public_repos} public repos <p><small>(Own Repos- ${user.ownRepos ? user.ownRepos : '0'}, Forked- ${user.forkedRepos})</small></p> </li>
                    <li class="list-group-item"><i class="fa fa-fw fa-clock-o"></i>Joined GitHub ${year} Year Ago  </li>
                    <li class="list-group-item"><i class="fa fa-fw fa-envelope"></i> ${user.email ? user.email : ''}  </li>
                    <li class="list-group-item"><i class="fa fa-fw fa-external-link"></i> <a href="${user.html_url}" target="_blank"  rel="noopener">View Profile On GitHub</a>   </li>
                    </ul>`;
  document.getElementById('userDetail').innerHTML = output;
}

function buildFollowing_card(followingArray,followingObj,url) {
  if(url){
    //document.querySelector('#followingDiv').removeChild(document.querySelector('#followingDiv').lastElementChild);
    document.querySelector('#collapseOne .card-body').removeChild(document.querySelector('#collapseOne .card-body').firstElementChild);
    document.querySelector('#collapseOne .card-body .gridFollowing').innerHTML  = '';
  }

  if(followingObj.last && !url){
    var lastPageNo = Number.parseFloat(followingObj.last.substring(followingObj.last.lastIndexOf('page=')+5,followingObj.last.length));
    document.querySelector('#headingOne button').innerText = 'Following ('+100*lastPageNo+') ';

  }
  else{
    if(!url){
        document.querySelector('#headingOne button').innerText = 'Following ('+followingArray.length+') ';
    }

  }

    let followingDiv = document.querySelector('#collapseOne .card-body .gridFollowing');

  if (followingArray.length != 0 ) {

    followingArray.forEach(obj => {
      let output = ` <div class="grid-item">
		<div class="card" style="width: 10rem;">
  <img class="card-img-top" src="${obj.avatar_url}" alt="${obj.login}" height="100" width="100">
  <div class="card-body">
    <h6 class="card-title">${obj.name?obj.name:''} <small>(${obj.login})</small></h6>
    <p><span style="float:left"><a href="https://alamnr.github.io/profile.html?user=${obj.login}" target="_blank"  rel="noopener"><small>Summary</small></a>
    </span><span style="float:right"><a href="https://github.com/${obj.login}" target="_blank"  rel="noopener"><small>Account</small></a></span></p>

  </div>
</div>
		</div>`;
      let divToAppend = document.createRange().createContextualFragment(output);
      followingDiv.appendChild(divToAppend);
    })
    var msnryFolowing = new Masonry( '.gridFollowing', {
      // options
      itemSelector: '.grid-item',
      columnWidth: 25
    });

    let paging = `
                <nav aria-label="Page navigation example">
                  <ul class="pagination justify-content-center">

                    <li class="page-item ${followingObj.first?'':'disabled'} ">
                    <a class="page-link" href="${followingObj.first}" ${followingObj.first?'':'tabindex="-1"'}  >First</a>
                    </li>
                    <li class="page-item ${followingObj.prev?'':'disabled'}"><a class="page-link" href="${followingObj.prev}" ${followingObj.prev?'':'tabindex="-1"'} >Previous</a></li>
                    <li class="page-item ${followingObj.next?'':'disabled'}"><a class="page-link" href="${followingObj.next}" ${followingObj.next?'':'tabindex="-1"'} >Next</a></li>
                    <li class="page-item ${followingObj.last?'':'disabled'}"><a class="page-link" href="${followingObj.last}" ${followingObj.last?'':'tabindex="-1"'} >Last</a></li>

                  </ul>
                </nav>
                  `;
                  //document.querySelector('#followingDiv').appendChild(document.createRange().createContextualFragment(paging));
                  document.querySelector('.gridFollowing').parentNode.insertBefore(document.createRange().createContextualFragment(paging),document.querySelector('#collapseOne .card-body').firstElementChild);
  }

}
function buildFollowers_card(followersArray,followersObj,url) {
  if(url){
    //document.querySelector('#followersDiv').removeChild(document.querySelector('#followersDiv').lastElementChild);
    document.querySelector('#collapseTwo .card-body').removeChild(document.querySelector('#collapseTwo .card-body').firstElementChild);

    document.querySelector('#collapseTwo .card-body .gridFollowers').innerHTML  = '';
  }


  if(followersObj.last && !url){
    var lastPageNo = Number.parseFloat(followersObj.last.substring(followersObj.last.lastIndexOf('page=')+5,followersObj.last.length));
    document.querySelector('#headingTwo button').innerText = 'Followers ('+100*lastPageNo+') ';

  }
  else{
    if(!url){
        document.querySelector('#headingTwo button').innerText = 'Followers ('+followersArray.length+') ';

    }

  }

    let followersDiv = document.querySelector('#collapseTwo .card-body .gridFollowers');


  if (followersArray.length != 0 ) {


    followersArray.forEach(obj => {
      let output = ` <div class="grid-item">
    <div class="card" style="width: 10rem;">
  <img class="card-img-top" src="${obj.avatar_url}" alt="${obj.login}" height="100" width="100">
  <div class="card-body">
    <h6 class="card-title">${obj.name?obj.name:''} <small>(${obj.login})</small></h6>
    <p><span style="float:left"><a href="https://alamnr.github.io/profile.html?user=${obj.login}" target="_blank"  rel="noopener"><small>Summary</small></a>
    </span><span style="float:right"><a href="https://github.com/${obj.login}" target="_blank"  rel="noopener"><small>Account</small></a></span></p>

  </div>
</div>
    </div>`;
      let divToAppend = document.createRange().createContextualFragment(output);
      followersDiv.appendChild(divToAppend);
    })
    var msnryFollowers = new Masonry( '.gridFollowers', {
      // options
      itemSelector: '.grid-item',
      columnWidth: 25
    });
    let paging = `
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center">

        <li class="page-item ${followersObj.first?'':'disabled'} ">
        <a class="page-link" href="${followersObj.first}" ${followersObj.first?'':'tabindex="-1"'}>First</a>
        </li>
        <li class="page-item ${followersObj.prev?'':'disabled'}"><a class="page-link" href="${followersObj.first}" ${followersObj.first?'':'tabindex="-1"'}>Previous</a></li>
        <li class="page-item ${followersObj.next?'':'disabled'}"><a class="page-link" href="${followersObj.next}" ${followersObj.next?'':'tabindex="-1"'}>Next</a></li>
        <li class="page-item ${followersObj.last?'':'disabled'}"><a class="page-link" href="${followersObj.last}" ${followersObj.last?'':'tabindex="-1"'}>Last</a></li>

      </ul>
    </nav>
                  `;
                  //document.querySelector('#followersDiv').appendChild(document.createRange().createContextualFragment(paging));
                  document.querySelector('.gridFollowers').parentNode.insertBefore(document.createRange().createContextualFragment(paging),document.querySelector('#collapseTwo .card-body').firstElementChild);

  }
  if(!url){
    document.querySelector('#indicator').style.width = '100%';
    document.querySelector('#indicator').innerHTML = '100% Done!';
    setTimeout(() => {
      document.querySelector('.progress').style.display = 'none';
      document.querySelector('#modal .animationload').style.display = 'none';
    }, 2000);

  }


}

function calculateDataAndGenerateChart(dataObj) {
  // calculate quarter commit count
  var then = new Date(dataObj.getUser().created_at);

  var today = new Date();
  var lastQuarter = today.getFullYear() + '-Q' + (Math.ceil((today.getMonth() + 1) / 3));

  //console.log(lastQuarter);
  for (var i = then.getFullYear(); i <= today.getFullYear(); i++) {
    for (var j = 1; j <= 4; j++) {
      var quarter = i + '-Q' + j;
      dataObj.getQuarterCommitCount().set(quarter, 0);
      if (quarter == lastQuarter) break;
    }

  }

  var unforkRepo = dataObj.getRepos().filter(repo => {
    return repo.fork === false && repo.size !== 0
  })
  //console.log('Own Repos -' + unforkRepo.length);
  dataObj.getUser().ownRepos = unforkRepo.length;
  dataObj.getUser().forkedRepos = dataObj.getRepos().length - unforkRepo.length;

  if (unforkRepo.length === 0) {
    buildUserDetails(dataObj.getUser());
    //buildFollow_ing_ers_card(dataObj);
    createLineChart('quarterCommitCount', dataObj);


  } else {

    unforkRepo.forEach((myRepo, index, repoArray) => {

      dataObj.getLangRepoCount().set(myRepo.language, (dataObj.getLangRepoCount().get(myRepo.language) ? dataObj.getLangRepoCount().get(myRepo.language) : 0) + 1);
      dataObj.getLangStarCount().set(myRepo.language, (dataObj.getLangStarCount().get(myRepo.language) ? dataObj.getLangStarCount().get(myRepo.language) : 0) + myRepo.watchers_count);

      dataObj.getRepoStarCount().set(myRepo.name, (dataObj.getRepoStarCount().get(myRepo.name) ? dataObj.getRepoStarCount().get(myRepo.name) : 0) + myRepo.watchers_count);
      dataObj.getRepoStarCountDescriptions().set(myRepo.name, myRepo.description ? myRepo.description : 'Description Not Found');

    })

    dataObj.getCommitMap().forEach((commits, repo) => {
      if (repo.fork === false && repo.size !== 0 && commits) {
        commits.forEach(commit => {

          var commitDate = new Date(commit.commit.committer.date);
          var commitQuarter = commitDate.getFullYear() + '-Q' + (Math.ceil((commitDate.getMonth() + 1) / 3));
          dataObj.getQuarterCommitCount().set(commitQuarter, dataObj.getQuarterCommitCount().get(commitQuarter) + 1);

          dataObj.getLangCommitCount().set(repo.language, (dataObj.getLangCommitCount().get(repo.language) ? dataObj.getLangCommitCount().get(repo.language) : 0) + 1);

          dataObj.getRepoCommitCount().set(repo.name, (dataObj.getRepoCommitCount().get(repo.name) ? dataObj.getRepoCommitCount().get(repo.name) : 0) + 1);
          dataObj.getRepoCommitCountDescriptions().set(repo.name, repo.description ? repo.description : 'Description Not Found');

        });
      }

    });

    // Generate Chart

    buildUserDetails(dataObj.getUser());
    //buildFollow_ing_ers_card(dataObj);
    createLineChart('quarterCommitCount', dataObj);
    createDoughnutChart('langRepoCount', dataObj);

    for (let value of dataObj.getLangStarCount().values()) {
      if (value) {
        let output = `<div id="langStarCountDiv" class="col-xs-12 col-sm-12 col-md-12 col-lg-4">
            <h4 class="text-center">Star per Language </h4>
            <canvas id="langStarCount"></canvas>
        </div>`;
        document.getElementById('langRepoCountDiv').className = 'col-xs-12 col-sm-12 col-md-12 col-lg-4';
        document.getElementById('langCommitCountDiv').className = 'col-xs-12 col-sm-12 col-md-12 col-lg-4';

        let targetDiv = document.getElementById('langRepoCountDiv')
        var divToAppend = document.createRange().createContextualFragment(output);
        targetDiv.parentNode.insertBefore(divToAppend, targetDiv.nextSibling)
        createDoughnutChart('langStarCount', dataObj);

        break;
      }
    }
    for (let value of dataObj.getLangCommitCount().values()) {
      if (value) {
        createDoughnutChart('langCommitCount', dataObj);
        break;
      }
    }

    for (let value of dataObj.getRepoCommitCount().values()) {
      if (value) {
        var top10SortedRepoCommitCount = new Map([...dataObj.getRepoCommitCount().entries()].sort((a, b) => b[1] - a[1]));
        var top10SortedRepoCommitCountDescription = new Map();
        var j = 0;
        top10SortedRepoCommitCount.forEach(function(value, key, map) {
          j++;
          if (j > 10) {
            map.delete(key);
          }
          if (value === 0) {
            map.delete(key);
          }
        })
        // console.log(top10SortedRepoCommitCount);
        top10SortedRepoCommitCount.forEach(function(value, key, map) {
          top10SortedRepoCommitCountDescription.set(key, dataObj.getRepoCommitCountDescriptions().get(key));
        })
        dataObj.setRepoCommitCountDescriptions(top10SortedRepoCommitCountDescription);
        dataObj.setRepoCommitCount(top10SortedRepoCommitCount);
        //console.log(repoCommitCountDescriptions);
        createDoughnutChart('repoCommitCount', dataObj);
        break;
      }
    }


    for (let value of dataObj.getRepoStarCount().values()) {
      if (value) {
        let output = `<div id="repoStarCountDiv"  class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
            <h4 class="text-center">Stars per Repo (top 10)</h4>
            <canvas id="repoStarCount"></canvas>
        </div>`;
        document.getElementById('repoCommitCountDiv').className = 'col-xs-12 col-sm-12 col-md-6 col-lg-6';



        let targetDiv = document.getElementById('repoCommitCountDiv')
        var divToAppend = document.createRange().createContextualFragment(output);
        targetDiv.parentNode.insertBefore(divToAppend, targetDiv.nextSibling)

        var top10SortedRepoStarCount = new Map([...dataObj.getRepoStarCount().entries()].sort((a, b) => b[1] - a[1]));
        var top10SortedRepoStarCountDescription = new Map();
        var j = 0;
        top10SortedRepoStarCount.forEach(function(value, key, map) {
          j++;
          if (j > 10) {
            map.delete(key);
          }
          if (value === 0) {
            map.delete(key);
          }
        })
        // console.log(top10SortedRepoStarCount);
        top10SortedRepoStarCount.forEach(function(value, key, map) {
          top10SortedRepoStarCountDescription.set(key, dataObj.getRepoStarCountDescriptions().get(key));
        })
        dataObj.setRepoStarCountDescriptions(top10SortedRepoStarCountDescription);
        dataObj.setRepoStarCount(top10SortedRepoStarCount);
        // console.log(repoStarCountDescriptions);
        createDoughnutChart('repoStarCount', dataObj);
        break;
      }
    }

    setShareButtonHref(dataObj.getUser());

    // document.querySelector('#indicator').style.width = '100%';
    // document.querySelector('#indicator').innerHTML = '100% Done!';
    // setTimeout(() => document.querySelector('.progress').style.visibility = 'hidden', 1000);

  }
}

function setShareButtonHref(user) {
  let profileUrl = "https://alamnr.github.io/profile.html?user=" + user.login;
  let shareText = user.login + "'s GitHub profile - Visualized:";
  let twitterUrl = "https://twitter.com/intent/tweet?url=" + profileUrl + "&text=" + shareText + "&via=javascript&related=scope_closer";
  let facebookUrl = "https://facebook.com/sharer.php?u=" + profileUrl + "&quote=" + shareText;
  document.getElementById('twitter').href = twitterUrl;
  document.getElementById('facebook').href = facebookUrl;
  //console.log(twitterUrl);
  //console.log(facebookUrl);
}

function getCommitPerRepos(url, commits, repo, dataObj) {
  //console.log('commit url-',url);
  return getJSON(url).then(response => {
    //console.log(response);
    if (!commits) {
      commits = [];
    }
    commits = commits.concat(response.data);
    //console.log(commits.length + " commits so far");
    //console.log("commits- ",response);
    if (response.linkData) {
      if (parse_link_header(response.linkData).next) {

        //console.log("There is more.");

        let next = parse_link_header(response.linkData).next;
        //console.log('next - ',next,'Repo Name-',repoName);
        return getCommitPerRepos(next, commits, repo);
      }
    }

    //console.log('repoName - ',repo.name,' commit - ',commits);
    dataObj.getCommitMap().set(repo, commits);
    return commits;

  }).catch(err => console.log(err));
}




function parse_link_header(header) {
  if (header.length === 0) {
    throw new Error("input must not be of zero length");
  }

  // Split parts by comma
  var parts = header.split(',');
  var links = {};
  // Parse each part into a named link
  for (var i = 0; i < parts.length; i++) {
    var section = parts[i].split(';');
    if (section.length !== 2) {
      throw new Error("section could not be split on ';'");
    }
    var url = section[0].replace(/<(.*)>/, '$1').trim();
    var name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;
  }
  return links;
}

function createDataObject() {
  var quarterCommitCount = new Map();
  var langRepoCount = new Map();
  var langStarCount = new Map();
  var langCommitCount = new Map();
  var repoCommitCount = new Map();
  var repoStarCount = new Map();
  var repoCommitCountDescriptions = new Map();
  var repoStarCountDescriptions = new Map();
  var user;
  var repos;
  var following = [];
  var followers = [];
  var commitMap = new Map();
  var dataObject = {
    getCommitMap: function() {
      return commitMap;
    },
    setCommitMap: function(commitMapN) {
      commitMap = commitMapN;
    },
    getQuarterCommitCount: function() {
      return quarterCommitCount;
    },
    setQuarterCommitCount: function(quarterCommitCountMap) {
      quarterCommitCount = quarterCommitCountMap;
    },
    getLangRepoCount: function() {
      return langRepoCount;
    },
    setLangRepoCount: function(langRepoCountMap) {
      langRepoCount = langRepoCountMap;
    },
    getLangStarCount: function() {
      return langStarCount;
    },
    setLangStarCount: function(langStarCountMap) {
      langStarCount = langStarCountMap;
    },
    getLangCommitCount: function() {
      return langCommitCount;
    },
    setLangCommitCount: function(langCommitCountMap) {
      langCommitCount = langCommitCountMap;
    },
    getRepoCommitCount: function() {
      return repoCommitCount;
    },
    setRepoCommitCount: function(repoCommitCountMap) {
      repoCommitCount = repoCommitCountMap;
    },
    getRepoStarCount: function() {
      return repoStarCount;
    },
    setRepoStarCount: function(repoStarCountMap) {
      repoStarCount = repoStarCountMap;
    },
    getRepoCommitCountDescriptions: function() {
      return repoCommitCountDescriptions;
    },
    setRepoCommitCountDescriptions: function(repoCommitCountDescriptionsMap) {
      repoCommitCountDescriptions = repoCommitCountDescriptionsMap;
    },
    getRepoStarCountDescriptions: function() {
      return repoStarCountDescriptions;
    },
    setRepoStarCountDescriptions: function(repoStarCountDescriptionsMap) {
      repoStarCountDescriptions = repoStarCountDescriptionsMap
    },
    getUser: function() {
      return user;
    },
    setUser: function(userObj) {
      user = userObj;
    },
    getRepos: function() {
      return repos;
    },
    setRepos: function(repoArray) {
      repos = repoArray;
    },
    getFollowing: function() {
      return following;
    },
    setFollowing:function(emptyArray) {
      following = emptyArray;
    },
    getFollowers: function() {
      return followers;
    },
    setFollowers:function(emptyArray) {
        followers = emptyArray;
      }

  };
  return dataObject;
}



function checkRateLimit() {
  let url = 'https://api.github.com/rate_limit?client_id=4451d14d8fff3a16d020&client_secret=d317892c35d7a7f4e383b92052cda6e8b7a3b3ea';
  getJSON(url).then(rateData => {
    //console.log(rateData);
    document.querySelector(".rate-limit").classList.toggle("rate-limited", rateData.rate.remaining === "0");
    document.getElementById("rate-limit-count").innerHTML = rateData.rate.remaining;
  }).catch(err => {
    console.log(err);
  });

}


// Google Analytics
(function(i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function() {
    (i[r].q = i[r].q || [])
    .push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o), m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-121404954-1', 'auto');
ga('send', 'pageview');


// Service worker Code

// 1. Register Service Worker
if (!('serviceWorker' in navigator)) {
  console.log('Service worker not supported');
  //return;
} else {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Registration successfull, scope is: ', registration.scope);
      }).catch(error => {
        console.log('Service worker registration failed, error: ', error);
      })
  }
}
