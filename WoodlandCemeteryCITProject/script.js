$(document).ready(() => {
  // loading dots
  let dotCount = 1;
  setInterval(() => {
    $("#loading-text").html("Loading" + ".".repeat(dotCount));
    dotCount += 1;
    if (dotCount > 3) {
      dotCount = 1;
    }
  }, 500);

  let currentHighlight = "";
  let title = "";
  let apiData = {
    sga: [],
    main: []
  };
  
  // load map
  $("#map").maphilight();

  // setup sections
  new Promise(async (resolve, reject) => {
    $("map").load("areas.html", () => {
      // all
      $('area').each(async function () {$(this).data('maphilight', {'alwaysOn': false, 'fillColor': 'f24141', 'fillOpacity': '0.3', 'strokeColor': 'a61728', 'shadow': true, 'shadowColor': 'f24141', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight')});
      
      // fountain
      $('area[title|="fountain" i]').data('maphilight', {'alwaysOn': true, 'fillColor': '1058c4', 'fillOpacity': '0.4', 'strokeColor': '1058c4', 'shadow': true, 'shadowColor': '1058c4', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
      $('area[title|="fountain" i]').mousemove(function (event) {landmark("fountain", event)});
      $('area[title|="fountain" i]').mouseout(function (event) {stopLandmark()});
      
      // entrance
      $('area[title|="entrance" i]').data('maphilight', {'alwaysOn': true, 'fillColor': '1058c4', 'fillOpacity': '0.4', 'strokeColor': '1058c4', 'shadow': true, 'shadowColor': '1058c4', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
      $('area[title|="entrance" i]').mousemove(function (event) {landmark("entrance", event)});
      $('area[title|="entrance" i]').mouseout(function (event) {stopLandmark()});
      
      // chapel
      $('area[title|="chapel" i]').data('maphilight', {'alwaysOn': true, 'fillColor': '1058c4', 'fillOpacity': '0.4', 'strokeColor': '1058c4', 'shadow': true, 'shadowColor': '1058c4', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
      $('area[title|="chapel" i]').mousemove(function (event) {landmark("chapel", event)});
      $('area[title|="chapel" i]').mouseout(function (event) {stopLandmark()});
      
      // see lot details
      $("area").each((i, elmnt) => {
        let x = 0;
        let y = 0;
        elmnt = $(elmnt);
      
        elmnt.mousedown(e => {
          if (elmnt.attr('title') === "Chapel" || elmnt.attr('title') === "Fountain" || elmnt.attr('title') === "Entrance") {
            return;
          }
          
          x = e.pageX;
          y = e.pageY;
        });
      
        elmnt.mouseup(e => {
          if (elmnt.attr('title') === "Chapel" || elmnt.attr('title') === "Fountain" || elmnt.attr('title') === "Entrance") {
            return;
          }
      
          if (Math.abs(e.pageX - x) < 5 && Math.abs(e.pageY - y) < 5 && apiData) {
            elmnt.mouseout();
      
            // hide person data
            $("#person-data-container").hide();
            $("#plot-data").css("display", "flex");
            $("#plot-name").text(elmnt.attr("title"));
      
            $("#plot-inhabitants").html(null);
            $("#plot-inhabitants").css("height", "auto");
            let location = elmnt.attr('title');
            for (let i = 0; i < apiData.length; i++) {
              if (apiData[i][4].replace(' ', '') + apiData[i][5].replace(' ', '') === location) {
                let middle = apiData[i][1];
                let fname = apiData[i][0];
                let lname = apiData[i][2];
      
                let inhabitant = $(`<li class="plot-inhabitant">${(fname + ' ' + middle + ' ' + lname).replace(null, '').replace(null, '').replace('  ', ' ').replace('  ', ' ')}</li>`);
      
                inhabitant.click(() => {
                  find(inhabitant.text(), location);
                });
      
                $("#plot-inhabitants").append(inhabitant);
              }
            }
      
            // add scroll bar
            if ($("#plot-inhabitants").height() > $(window).height() - 220) {
              $("#plot-inhabitants").css("overflow-y", "scroll");
              $("#plot-inhabitants").height($(window).height() - 220);
            } else {
              $("#plot-inhabitants").css("overflow-y", "hidden");
              $("#plot-inhabitants").css("height", "auto");
            }
      
            // highlighting
            title = location;
            if (currentHighlight != '') {
              $('area[title|="' + currentHighlight + '" i]').data('maphilight', {'alwaysOn': false, 'fillColor': 'f24141', 'fillOpacity': '0.3', 'strokeColor': 'a61728', 'shadow': true, 'shadowColor': 'f24141', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
            }
            elmnt.data('maphilight', {'alwaysOn': true, 'fillColor': 'f5fc23', 'fillOpacity': '0.4', 'strokeColor': 'f5fc23', 'shadow': true, 'shadowColor': 'f5fc23', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
            currentHighlight = title;
          }
        });
      });
    });

    resolve();
  })
  .then(async () => {
    // fetch single grave data
    await fetch("https://woodlandcemeteryapi.illusion705.repl.co/data/single_graves")
      .then(response => response.json())
      .then(data => {
        apiData.sga = data;
      });
    
    // fetch main data
    await fetch("https://woodlandcemeteryapi.illusion705.repl.co/data/regular_lots")
      .then(response => response.json())
      .then(data => {
        apiData.main = data;
      });

    // names that have already been added to prevent duplicates
    let alreadyAdded = [];

    // HTML for select
    let nameListHTML = "";

    // add main graves
    for (let i = 0; i < apiData.main.length; i++) {
      // get value to display as option
      let searchDisplayVal = 
        (apiData.main[i][0] ? apiData.main[i][0].trim() + " " : "") + // first name
        (apiData.main[i][1] ? apiData.main[i][1].trim() + " " : "") + // middle name
        (apiData.main[i][2] ? apiData.main[i][2].trim() + " " : "") + // last name
        ("(" + apiData.main[i][4].trim() + apiData.main[i][5].trim() + ")"); // section and lot number

      // add to HTML if not duplicate
      if (!alreadyAdded.includes(searchDisplayVal)) {
        nameListHTML += ('<option value="' + searchDisplayVal + '"></option>').replaceAll(/  */g, " "); // regex to replace multiple spaces in a row with one space
        alreadyAdded.push(searchDisplayVal);
      }
    }

    // add single graves
    for (let i = 0; i < apiData.sga.length; i++) {
      // get value to display as option
      let searchDisplayVal = 
        (apiData.sga[i][0] ? apiData.sga[i][0].trim() + " " : "") + // first name
        (apiData.sga[i][1] ? apiData.sga[i][1].trim() + " " : "") + // middle name
        (apiData.sga[i][2] ? apiData.sga[i][2].trim() + " " : "") + // last name
        ("(" + apiData.sga[i][4].trim() + ")"); // section

      // add to HTML if not duplicate
      if (!alreadyAdded.includes(searchDisplayVal)) {
        nameListHTML += ('<option value="' + searchDisplayVal + '"></option>');
        alreadyAdded.push(searchDisplayVal);
      }
    }

    // add html
    document.getElementById('name-list').innerHTML = nameListHTML;

    // show search form
    $("#search-form").fadeIn();
    $('#loading').fadeOut();
  });
  
  // zoom
  var zoom = 1;
  function scale(amount) {
    $('.map').css({'transform': `scale(${amount}, ${amount})`});
    $('#map').css({'transform': 'scale(1, 1)'});
    zoom = amount;
  }
  
  // zoom buttons
  var zooming = false;
  function zoomIn() {
    if (zooming == true || zoom >= 3) {
      return;
    }
    zooming = true;
    let i = 0;
    let interval = setInterval(() => {
      if (i >= 0.3 || zoom >= 3) {
        zooming = false;
        clearInterval(interval);
        return;
      } else {
        scale(zoom + 0.01);
        i += 0.01;
      }
    }, 10);
  }

  $("#zoom-in").click(zoomIn);
  
  function zoomOut() {
    if (zooming == true || zoom <= 1) {
      return;
    }
    zooming = true;
    let changeX;
    let changeY;
    changeX = -img.offsetLeft / 30;
    changeY = -img.offsetTop / 30;
    let x = 0;
    interval = setInterval(() => {
      if (x >= 0.3 || zoom <= 1) {
        zooming = false;
        img.style.top = '0px';
        img.style.left = '0px';
        clearInterval(interval);
        return;
      }
      else {
        scale(zoom - 0.01);
        x += 0.01;
        img.style.top = img.offsetTop + changeY + 'px';
        img.style.left = img.offsetLeft + changeX + 'px';
      }
    }, 10);
  }

  $("#zoom-out").click(zoomOut);
  
  function landmark(name, event) {
    $('#landmark-info').css({'display': 'flex'});
    let left = event.pageX + 5;
    let top = event.pageY - 30 * zoom;
    if (name === 'fountain') {
      $('#landmark-info').css({'top': top + 'px', 'left': left + 'px', 'font-size': 17 * zoom + 'px'});
      $('#landmark-name').html("Fountain");
    }
    else if (name === 'chapel') {
      $('#landmark-info').css({'top': top + 'px', 'left': left + 'px', 'font-size': 17 * zoom + 'px'});
      $('#landmark-name').html("Chapel");
    }
    else {
      $('#landmark-info').css({'top': top + 'px', 'left': left + 'px', 'font-size': 17 * zoom + 'px'});
      $('#landmark-name').html("Entrance");
    }
  }
  
  function stopLandmark() {
    $('#landmark-info').css({'display': 'none'});
  }
  
  $("form").submit(function (e) {
    e.preventDefault();
  });

  // find person
  function find(name = null, theirSection = null) {
    // get name from input
    if (!name) {
      name = $("#name-input").val();
    }

    // exit if no name
    if (name === "") {
      return;
    }

    // parse input for name and section
    if (name.indexOf("(") != -1) {
      theirSection = name.substring(name.indexOf('(') + 1, name.length - 1);
      name = name.substring(0, name.indexOf('(') - 1);
    }

    // list of matched people
    let matches = [];

    // search main data
    for (let i = 0; i < apiData.main.length; i++) {
      let checkName = 
        (apiData.main[i][0] ? apiData.main[i][0].trim() + " " : "") + // first name
        (apiData.main[i][1] ? apiData.main[i][1].trim() + " " : "") + // middle name
        (apiData.main[i][2] ? apiData.main[i][2].trim() : ""); // last name
      
      // get name matches
      if (checkName.trim() === name.trim() || theirSection.trim() === apiData.main[i][4].trim() + apiData.main[i][5].trim()) {
        console.log(checkName)
        console.log(name.trim())
        console.log(checkName.trim() === name.trim())
        console.log(theirSection.trim())
        console.log(apiData.main[i][4].trim() + apiData.main[i][5].trim())
        console.log(theirSection.trim() === apiData.main[i][4].trim() + apiData.main[i][5].trim())
      }
      
      if (name.trim() === checkName && theirSection.trim() === apiData.main[i][4].trim() + apiData.main[i][5].trim()) {      
        matches.push({
          section: apiData.main[i][4].trim(),
          lot: apiData.main[i][5] ? apiData.main[i][5].trim() : "",
          name: (apiData.main[i][0] ? apiData.main[i][0].trim() + " " : "") + // first name
                (apiData.main[i][1] ? apiData.main[i][1].trim() + " " : "") + // middle name
                (apiData.main[i][2] ? apiData.main[i][2].trim() : ""), // last name
          firstName: apiData.main[i][0] ? apiData.main[i][0].trim() : null,
          middleName: apiData.main[i][1] ? apiData.main[i][1].trim() : null,
          lastName: apiData.main[i][2] ? apiData.main[i][2].trim() : null,
          title: apiData.main[i][3] ? apiData.main[i][3].trim() : "N/A",
          graveNum: apiData.main[i][6] ? apiData.main[i][6].trim() : "N/A",
          death: apiData.main[i][7] ? apiData.main[i][7].trim() : "N/A",
          findAGraveId: apiData.main[i][9] ? apiData.main[i][9].trim() : null,
          sketchfabId: apiData.main[i][10] ? apiData.main[i][10].trim() : null
        });

        // add notes
        if (apiData.main[i].length === 12) {
          matches[matches.length - 1].notes = !apiData.main[i][11] ? "N/A" : apiData.main[i][11].trim();
        }
      }
    }

    // search single grave data
    for (let i = 0; i < apiData.sga.length; i++) {
      let checkName = 
        (apiData.sga[i][0] ? apiData.sga[i][0].trim() + " " : "") + // first name
        (apiData.sga[i][1] ? apiData.sga[i][1].trim() + " " : "") + // middle name
        (apiData.sga[i][2] ? apiData.sga[i][2].trim() : ""); // last name
      
      // get name matches
      if (name.trim() === checkName && theirSection.trim() === apiData.sga[i][4].trim()) {
        matches.push({
          section: apiData.sga[i][4].trim(),
          lot: "Single Grave",
          name: (apiData.sga[i][0] ? apiData.sga[i][0].trim() + " " : "") + // first name
                (apiData.sga[i][1] ? apiData.sga[i][1].trim() + " " : "") + // middle name
                (apiData.sga[i][2] ? apiData.sga[i][2].trim() : ""), // last name
          firstName: apiData.sga[i][0] ? apiData.sga[i][0].trim() : null,
          middleName: apiData.sga[i][1] ? apiData.sga[i][1].trim() : null,
          lastName: apiData.sga[i][2] ? apiData.sga[i][2].trim() : null,
          title: apiData.sga[i][3] ? apiData.sga[i][3].trim() : "N/A",
          graveNum: apiData.sga[i][6] ? apiData.sga[i][6].trim() : "N/A",
          death: apiData.sga[i][7] ? apiData.sga[i][7].trim() : "N/A",
          findAGraveId: apiData.sga[i][9] ? apiData.sga[i][9].trim() : null,
          sketchfabId: apiData.sga[i][10] ? apiData.sga[i][10].trim() : null
        });

        // add notes
        if (apiData.sga[i].length === 12) {
          matches[matches.length - 1].notes = !apiData.sga[i][11] ? "N/A" : apiData.sga[i][11].trim();
        }
      }
    }

    // display person data container
    $("#person-data-container").css("display", "flex");
    $("#plot-data").hide();

    // set matches found
    $("#person-matches-found").text(matches.length + (matches.length !== 1 ? " matches" : " match") + " found");

    // display matches
    $("#person-records").html(null);
    for (let match of matches) {
      // create record
      let record = $("<div></div>").html($("#person-data-record-template").html());

      // update record data
      record.find(".person-name").text(match.name);
      record.find(".person-section").text("Section: " + match.section);
      record.find(".person-lot-num").text("Lot Number: " + match.lot);
      record.find(".person-title").text("Title: " + match.title);
      record.find(".person-grave-number").text("Grave Number: " + match.graveNum);
      record.find(".person-death-date").text("Death Date: " + match.death);

      // notes
      if (match.notes !== undefined) {
        record.find(".person-notes").css("display", "block").text("Notes: " + match.notes);
      }

      // FindAGrave link
      if (match.findAGraveId) {
        record.find(".find-a-grave-link")
          .css("display", "block")
          .attr("href", `https://www.findagrave.com/memorial/${match.findAGraveId}/`);
      }

      // sketchfab view button
      if (match.sketchfabId) {
        record.find(".sketchfab-view-container").css("display", "flex");

        record.find(".sketchfab-view").click(() => {
          showSketchfab(match.name, match.sketchfabId);
        });
      }
      
      // add record to DOM
      $("#person-records").append(record);
    }

    // reset search input
    $('#name-input').val("");
    
    // highlight section
    section = matches[0].section.toLowerCase() + matches[0].lot;
    
    if (currentHighlight != "") {
      $("area[title|=\"" + currentHighlight + "\" i]").data('maphilight', {'alwaysOn': false, 'fillColor': 'f24141', 'fillOpacity': '0.3', 'strokeColor': 'a61728', 'shadow': true, 'shadowColor': 'f24141', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
    }
  
    $("area[title|=\"" + section + "\" i]").data('maphilight', {'alwaysOn': true, 'fillColor': 'f5fc23', 'fillOpacity': '0.4', 'strokeColor': 'f5fc23', 'shadow': true, 'shadowColor': 'f5fc23', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
    
    currentHighlight = section;
  }

  // submit search form
  $("#submit-search-form").click(() => find());
  
  // remove links on sections
  const map = document.querySelector("map");
  
  map.onclick = e => {
    e.preventDefault();
  }

  // sketchfab embed
  function showSketchfab(name, id) {
    // hide admin login
    $("#admin-login-container").hide();
    
    // show sketchfab model
    $("#sketchfab-embed-container").css("display", "flex");

    $("#sketchfab-embed")
      .attr("title", name + " gravestone")
      .attr("src", `https://sketchfab.com/models/${id}/embed`);

    $("#sketchfab-title").text(name + " Gravestone");
  }
  
  // map dragging
  // code from: https://www.w3schools.com/howto/howto_js_draggable.asp
  const img = document.querySelector(".center");
  dragElement(img);
  dragElement(map);
  
  function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
  
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
  
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
  
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
  
      // set the element's new position:
      if (!(img.offsetTop - pos2 > 0 + ((zoom - 1) * 433)) && !(img.offsetTop - pos2 < -255 - ((zoom - 1) * 433))) {
        img.style.top = (img.offsetTop - pos2) + 'px';
      }
      if (!(img.offsetLeft - pos1 > 0 + ((zoom - 1) * 816)) && !(img.offsetLeft - pos1 < -340 - ((zoom - 1) * 816))) {
        img.style.left = (img.offsetLeft - pos1) + 'px';
      }
    }
  
    function closeDragElement() {
      // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
  
  // hide plot data
  $("#plot-data-hide").click(() => {
    $("#plot-data").hide();
  
    // remove highlight
    $('area[title|="' + currentHighlight + '" i]').data('maphilight', {'alwaysOn': false, 'fillColor': 'f24141', 'fillOpacity': '0.3', 'strokeColor': 'a61728', 'shadow': true, 'shadowColor': 'f24141', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
    currentHighlight = '';
  });

  // hide person data
  $("#person-data-hide").click(() => {
    $("#person-data-container").hide();
    $('area[title|="' + currentHighlight + '" i]').data('maphilight', {'alwaysOn': false, 'fillColor': 'f24141', 'fillOpacity': '0.3', 'strokeColor': 'a61728', 'shadow': true, 'shadowColor': 'f24141', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
    currentHighlight = "";
  });
  
  // notable burials
  $("#show-notable-burials").click(() => {
    $("#person-data-container").hide();
    $("#plot-data").css("display", "flex");
    $("#plot-name").text("Notable Burials");
  
    $("#plot-inhabitants").html(null);
    $("#plot-inhabitants").css("height", "auto");
  
    let notableBurials = [{
      fname: "Arthur",
      mname: "Robert",
      lname: "Ashe",
      section: "M",
      lot: "11"
    }, {
      fname: "John",
      lname: "Jasper",
      section: "R",
      lot: "1"
    }, {
      fname: "Arthur",
      mname: "Lee",
      lname: "Gardner",
      section: "V",
      lot: "26"
    }, {
      fname: "Charles",
      mname: "T.",
      lname: "Russell",
      section: "W",
      lot: "13"
    }, {
      fname: "Augustus",
      lname: "Brown",
      section: "R",
      lot: "67"
    }, {
      fname: "Christopher",
      mname: "French",
      lname: "Foster",
      section: "T",
      lot: "23"
    }, {
      fname: "Lucy",
      lname: "Foster",
      section: "T",
      lot: "23"
    }, {
      fname: "Annie",
      lname: "Cofer",
      section: "H",
      lot: "50"
    }, {
      fname: "Dawson",
      lname: "Cofer",
      section: "H",
      lot: "50"
    }, {
      fname: "Florence",
      lname: "Walker",
      section: "H",
      lot: "14"
    }, {
      fname: "Hattie",
      lname: "Jefferson",
      section: "S",
      lot: "3"
    }, {
      fname: "Henry",
      mname: "J.",
      lname: "Moore",
      section: "U",
      lot: "23"
    }, {
      fname: "I.",
      mname: "Lincoln",
      lname: "Bailey",
      section: "U",
      lot: "16"
    }, {
      fname: "Thomas",
      lname: "Crump",
      section: "R",
      lot: "35"
    }, {
      fname: "William",
      lname: "Browne",
      section: "J",
      lot: "20"
    }, {
      fname: "Zenobia",
      mname: "G.",
      lname: "Gilpin",
      section: "F",
      lot: "53"
    }, {
      fname: "Marietta",
      lname: "Chiles",
      section: "W",
      lot: "16"
    }, {
      fname: "John",
      lname: "Hewin",
      section: "W",
      lot: "17"
    }, {
      fname: "Elizabeth",
      lname: "Gaiters",
      section: "G",
      lot: "102"
    }, {
      fname: "Leslie",
      lname: "Bolling",
      section: "T",
      lot: "15"
    }, {
      fname: "Robert",
      lname: "Pharr",
      section: "K",
      lot: "1"
    }, {
      fname: "Martha",
      lname: "Anderson",
      section: "C",
      lot: "21"
    }, {
      fname: "Clarence",
      mname: "P.",
      lname: "Hayes",
      section: "T",
      lot: "27"
    }];
  
    for (let person of notableBurials) {
      let inhabitant = $(`<li class="plot-inhabitant">${(person.fname + ' ' + (person.mname ? (person.mname + " ") : null) + person.lname + " (" + person.section + person.lot + ")").replace(null, '').replace(null, '').replace('  ', ' ').replace('  ', ' ')}</li>`);
  
      inhabitant.click(() => {
        find(inhabitant.text(), person.section + person.lot);
      });
  
      $("#plot-inhabitants").append(inhabitant);
    }
  
    // add scroll bar
    if ($("#plot-inhabitants").height() > $(window).height() - 220) {
      $("#plot-inhabitants").css("overflow-y", "scroll");
      $("#plot-inhabitants").height($(window).height() - 220);
    } else {
      $("#plot-inhabitants").css("overflow-y", "hidden");
      $("#plot-inhabitants").css("height", "auto");
    }
  
    // remove highlighting
    if (currentHighlight != '') {
      $('area[title|="' + currentHighlight + '" i]').data('maphilight', {'alwaysOn': false, 'fillColor': 'f24141', 'fillOpacity': '0.3', 'strokeColor': 'a61728', 'shadow': true, 'shadowColor': 'f24141', 'shadowOpacity': 0.7, 'shadowY': 3, 'shadowPosition': 'outside'}).trigger('alwaysOn.maphilight');
    }
  });

  // password authentication
  function checkPassword(input) { 
    // loading animation
    const loadingAnimation = new LoadingAnimation($("#submit-admin-password"));
    loadingAnimation.start();

    // disable input
    $("#admin-password").attr("disabled", true);
    
    // send password
    const data = {
      password: input
    };
    
    fetch("https://woodlandcemeteryapi.illusion705.repl.co/data/admin_notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      // end loading animation
      loadingAnimation.end();

      // enable input
      $("#admin-password").attr("disabled", false);

      // check password
      if (data.msg === "valid password") {
        // clear password input
        $("#admin-password").val(null);

        // hide admin password panel and button
        $("#admin-login-container").hide();
        $("#open-admin-login").hide();

        // show successful login message
        const message = new HeaderMessage("Successfully logged in as admin.", "green", 2);
        message.display();

        // add main grave notes to data
        for (let i = 0; i < apiData.main.length; i++) {
          apiData.main[i].push(data.notes.main[i]);
        }

        // add single grave notes to data
        for (let i = 0; i < apiData.sga.length; i++) {
          apiData.sga[i].push(data.notes.sga[i]);
        }
      } else {
        // show admin alert
        $("#admin-alert").show();
      }
    });
  }

  // submit admin password
  $("#submit-admin-password-container").click(() => {
    checkPassword($("#admin-password").val());
  });
  
  // show admin password form
  $("#open-admin-login").click(() => {
    $("#admin-login-container").css("display", "flex");

    // hide sketchfab model
    $("#sketchfab-embed-container").hide();
  });

  // hide admin password form
  $("#admin-login-hide").click(() => {
    $("#admin-login-container").hide();
  });

  // hide sketchfab model
  $("#sketchfab-hide").click(() => {
    $("#sketchfab-embed-container").hide();
  });
});

// loading button animation
class LoadingAnimation {
  constructor(element, size = 20, thickness = 2) {
    this.element = element;
    this.thickness = thickness;
    this.initialHeight = element.outerHeight();
    this.initialWidth = element.outerWidth();
    this.initialPadding = (element.innerWidth() - element.width()) / 2;
    this.initialDisplay = element.css("display");
    this.text = element.text();
    this.size = size;
  }

  start() {
    const loadingCircle = $("<div id=\"loading-circle\"></div>");
    this.element.css("height", this.initialHeight + "px");
    this.element.css("width", this.initialWidth + "px");
    this.element.css("display", "flex");
    this.element.css("justify-content", "center");
    this.element.css("align-items", "center");
    this.element.css("padding", "0");
    loadingCircle.css("border-top", this.thickness + "px solid white");
    loadingCircle.css("border-bottom", this.thickness + "px solid white");
    loadingCircle.css("border-left", this.thickness + "px solid transparent");
    loadingCircle.css("border-right", this.thickness + "px solid transparent");
    this.element.empty();
    this.element.append(loadingCircle);

    if (this.size != 20) {
      this.element.children().css("height", this.size + "px");
      this.element.children().css("width", this.size + "px");
    }
  }

  end() {
    this.element.empty();
    this.element.text(this.text);
    this.element.css("padding", this.initialPadding);
    this.element.css("display", this.initialDisplay);
  }
}

// header message
class HeaderMessage {
  constructor(message, color, time = null) {
    this.message = message;

    if (color === "red") {
      this.color = "#e35b5b";
    } else {
      this.color = "#8acf8b";
    }

    this.time = time;
  }

  display() {
    const headerMessage = $("#header-message");
    const headerMessageText = $("#header-message-text");
    const headerMessageHide = $("#header-message-hide");
    
    headerMessageText.text(this.message);
    headerMessage.css("background", this.color);
    headerMessage.css("opacity", "1.0");
    headerMessage.css("display", "flex");

    if (this.time) {
      this.timeout = setTimeout(() => {
        let i = 0;
        this.interval = setInterval(() => {
          headerMessage.css("opacity", (1.0 - i * 0.02).toString());

          if (i === 99) {
            headerMessage.hide();
            clearInterval(this.interval);
          }

          i++;
        }, 1);
      }, this.time * 1000);
    }

    headerMessageHide.click(() => {
      headerMessage.hide();
      clearTimeout(this.timeout);
      clearInterval(this.interval);
    });
  }
}