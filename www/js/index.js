/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var contacts_number = 0;
var phone_list = [];
var name_list = [];
var alert_message = "";
var message = "I'm in trouble!";
var boardIp = "192.168.1.202:8000/getstatus";

var smsProps = {
    number : "0726242390",
    message : "Hilfe, hilfe mich!",
    success : function () {},
    error : function (e) { alert('Message Failed:' + e); },
};

var app = {
    // Application Constructor
    initialize: function(){

      //boardIp = localStorage.getItem("boardIp");
      $("#txtIp").attr("placeholder", boardIp);
        this.bindEvents();
		$("*[data-action=close-menu]").click(app.hideMenu);
		$("*[data-action=show-menu]").click(app.showMenu);
		$("*[data-action=toggle-menu]").click(app.toggleMenu);
		$("#content").width( $( window ).width() );
		$("#header").width( $( window ).width() );
		$("*[data-role=page]").first().show();
		hash = location.hash.substr(1).split('&');
		if(document.getElementById(hash[0])){
			app.showPage(hash[0]);
		}
		contacts_number = localStorage.getItem("contacts_number");
    if(contacts_number == null)
      contacts_number = 0;
    message = localStorage.getItem("message");
    if(message == null)
      message = "Oh oh.";
    //app.loadContacts();
    $("#btnSend").bind("click", app.sendSms);
		setInterval(app.listenToRequest, 2000);
    app.loadTable();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
		    window.addEventListener('hashchange', this.hashChange, false);
        $("#btnIp").bind("click", function () {
		        boardIp = $("#txtIp").val();
		        $("#txtIp").val("");
		        $("#txtIp").attr("placeholder", boardIp);

		        localStorage.setItem("boardIp", boardIp);

		    });
        $("#btn_save").bind('click',function(){
          if($("#phone").val() !== '' && $("#name").val() !== ''){
            alert("Successfully added contact!");
            phone = $("#phone").val();
            name = $("#name").val();
            $("#phone").val('');
            $("#name").val('');
            item = {name: name, phone: phone};
            localStorage.setItem("contact" + contacts_number, JSON.stringify(item));
            //$("#contacts").append(app.contactElementTemplate(contacts_number));
            contacts_number++;
            localStorage.setItem("contacts_number", contacts_number);
            app.loadTable();
          }
        });
        $("#btn_save_msg").bind('click',function(){
          if($("#message").val() !== ''){
            message = $("#message").val();
            $("#message").val('');
            $("#current_message").html(message);
            localStorage.setItem("message", message);
            alert("Default message has been changed");
          }
        });
        $("#btn_remove").bind("click", function(){
          var id = $(this).closest("div").attr("id");
        });
        $("#toggle_message").bind("click", function(){
           $("#change_message").toggle();
        });
        $("#toggle_add_contact").bind("click", function(){
           $("#add_contact").toggle();
        });
        $("#btn_empty").bind("click", function(){
          for(var i = 0; i < parseInt(contacts_number); i++){
            localStorage.removeItem('contact' + i);
          }
          contacts_number = 0;
          localStorage.setItem('contacts_number', contacts_number);
          alert("Agenda is cleared.");
          app.loadTable();

        });
    },
    listenToRequest: function () {
        if (boardIp != "") {
            var url = "http://" + boardIp;
            $.get(url, function (data) {
                //console.log(data);
                if (data.tosend != 0) {
                    console.log(parseInt(contacts_number));
                    for( var i = 0; i < parseInt(contacts_number); i++){
                      var item = JSON.parse(localStorage.getItem('contact' + i));
                      console.log(item.phone);
                      //smsProps.number = item.phone;
                      //smsProps.message = message;
                      sms.send(item.phone, message, {}, smsProps.success, smsProps.error);
                  }
                }
            });
        }
    },
    sendSms: function() {
        var number = document.getElementById('numberTxt').value;
        var message = document.getElementById('messageTxt').value;

        if (typeof sms === 'undefined')
            alert("Plugin for sms is not installed");
        var success = function () { alert('Message sent successfully'); };
        var error = function (e) { alert('Message Failed:' + e); };
        sms.send(number, message, {}, success, error);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
	//events on hash/location change
  contactElementTemplate: function(i){
    var item = JSON.parse(localStorage.getItem('contact' + i));
    if(item !== null)
      //return "<div id=\"contact_" +  i + "\">" +
        //item.name + ": " + item.phone + "<button id=\"btn_remove\"" +
        //"class=\"btn raised\">Remove</button></div>";
        return "<div id=\"contact_" +  i + "\">" +
          item.name + ": " + item.phone + "</div>";
    else {
      return;
    }
  },

  loadContacts: function(){
    $("#contacts_list").html(' ');
    for(var i = 0; i < contacts_number; i++){
      $("#contacts_list").append(app.contactElementTemplate(i));
    }
  },

  loadTable: function(){
    var row = "";
    $("#contactsTbl").html('<tr>\
      <th colspan="2"><strong>Your contacts</strong></th>\
    </tr>\
    <tr>\
      <th>Name</th>\
      <th>Number</th>\
    </tr> ');
    if(contacts_number == 0){
      $("#noContacts").show();
      $("#contactsTbl").hide();
    }
    else{
      $("#noContacts").hide();
      for(var i = 0; i < parseInt(contacts_number); i++){
        var item = JSON.parse(localStorage.getItem('contact' + i));
        row = "<tr><td>" + item.name + "</td><td>" + item.phone + "</td><tr>";
        $("#contactsTbl").append(row);
      }

      $("#contactsTbl").show();
    }
  },

	hashChange: function(){
		var hash = location.hash.substr(1);
		var values = {};
		hash = hash.split('&');
		hash.forEach(function(el,index){
			if(el.indexOf("=")>=0){
				el = {name:el.split("=")[0] , value:el.split("=")[1]};
				values[el.name] = el.value;
				hash[index]=el;
			}
		});
		if(document.getElementById(hash[0])){
			app.showPage(hash[0]);
		}
	},
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
	showPage: function(id){
		if( document.getElementById(id).getAttribute("data-role") == "page"){
			$("*[data-role=page]").hide();
			$("#"+id).show();
			app.hideMenu();
		}
	},
	showMenu: function(){
		document.getElementById("app").classList.add("show");
	},

	hideMenu: function(){
		document.getElementById("app").classList.remove("show");
	},

	toggleMenu: function(){
		if(document.getElementById("app").classList.contains("show")){
			app.hideMenu();
		}else{
			app.showMenu();
		}
	},

};
