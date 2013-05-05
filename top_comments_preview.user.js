// ==UserScript==
// @name           Reddit - Top Comments Preview
// @namespace      http://userscripts.org/scripts/show/126494
// @author         Erik Wannebo (rewritten by gavin19)
// @description    Preview to the top comments on Reddit
// @include        http://www.reddit.com/*
// @exclude        http://www.reddit.com/*/comments/*
// @include        https://www.reddit.com/*
// @exclude        https://www.reddit.com/*/comments/*
// @version        1.3
// ==/UserScript==
(function () {
	var topCP = {
		opts: {
			/* Number of comments to display. Default is 3 */
			topComments: 3,
			/* click or hover. Do you want to hover the link to trigger it, or click? */
			eventType: 'click'
		},
		addTopLinks: function () {
			var i, len, link, articleID,
			a = document.querySelectorAll( '.comments:not(.empty)' );
			if ( a.length ) {
				for ( i = 0, len = a.length; i < len; i += 1 ) {
					if ( !a[i].parentNode.querySelector( '.toplink' ) && /[0-9]/.test( a[i] ) ) {
						articleID = a[i].getAttribute('href');
						articleID = articleID.substring( articleID.indexOf( '/comments/' ) + 10, articleID.indexOf( '/comments/' ) + 16);
						link = document.createElement( 'a' );
						link.className = 'toplink';
						link.href = 'javascript:void(0);';
						link.setAttribute( 'id', 'toplink' + articleID );
						link.setAttribute( 'style', 'color:orangered;text-decoration:none;' );
						link.textContent = ' top';
						a[i].parentNode.parentNode.querySelector( '.first' ).insertBefore( link, null );
						topCP.addListener( link, articleID );
					}
				}
			}
		},
		addListener: function ( link, id ) {
			link.addEventListener(topCP.opts.eventType, function () {
				topCP.retrieveTopComments( this, id );
			});
		},
		retrieveTopComments: function ( ele, articleID ) {
			var pre, thisPre, url, xhr;
			ele = ele.parentNode.parentNode;
			if ( !document.querySelector( '#preview' + articleID ) ) {
				pre = document.createElement( 'div' );
				pre.setAttribute( 'id', 'preview' + articleID );
				pre.textContent = 'loading...';
				ele.querySelector( '.first' ).insertBefore( pre, null );
				ele.style.display = 'inline-block';
				url = 'http://www.reddit.com/comments/' + articleID + '/.json?limit=' + ( topCP.opts.topComments + 5 ) + '&sort=top';
				xhr = new XMLHttpRequest();
				xhr.open( 'GET', url, true );
				xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
				xhr.onreadystatechange = function () {
					if ( xhr.readyState === 4 && xhr.status === 200 ) {
						topCP.onloadJSON( xhr );
					}
				};
				xhr.send( null );
			} else {
				thisPre = document.querySelector( '#preview' + articleID );
				thisPre.parentNode.removeChild( thisPre );
				ele.style.display = 'inline';
			}
		},
		onloadJSON: function ( response ) {
			var i, len, content, ups, downs, authorLink, contentDiv,
			newHtml = '',
			comments = JSON.parse( response.responseText ),
			commentsLength = comments[1].data.children.length,
			articleID = comments[0].data.children[0].data.id;
			len = topCP.opts.topComments < commentsLength ? topCP.opts.topComments : commentsLength;
			for ( i = 0; i < len; i += 1 ) {
				content = comments[1].data.children[i].data.body_html;
				if ( content ) {
					contentDiv = document.createElement( 'div' );
					contentDiv.innerHTML = content;
					content = contentDiv.firstChild.textContent;
					author = comments[1].data.children[i].data.author;
					ups = comments[1].data.children[i].data.ups;
					downs = comments[1].data.children[i].data.downs;
					newHtml += (i > 0 ? '<hr>' : '');
					newHtml += '<a class="authorLink" target="_blank" href="/u/' + author;
					newHtml += '">' + author + '</a>&nbsp;&nbsp;';
					newHtml += '(+' + ups + '|-' + downs + ')<br />' + content;
				}
			}
			document.querySelector( '#preview' + articleID ).innerHTML = newHtml;
		},
		addStyle: function () {
			var sheet = '' + '\
			div[id^="preview"] {\
				font-size:normal;\
				box-sizing:border-box;\
				-moz-box-sizing:border-box;\
				background:rgba(245,245,250,.7);\
				border-radius:5px;\
				border:1px solid #000;\
				box-shadow:1px 1px 1px #000;\
				white-space:normal;\
				padding:5px;\
				margin:5px 0;\
			}\
			div[id^="preview"] .md {\
				border:1px solid #000;\
				box-shadow:1px 1px 1px #000;\
				background:rgba(225, 226, 227, .9);\
				box-sizing:border-box;\
				-moz-box-sizing:border-box;\
				margin:3px;\
				padding:2px 8px;\
			}\
			div[id^="preview"] .authorLink, div[id^="preview"] .md a {\
				font-weight:bold;\
				text-decoration:underline;\
				color:#369!important;\
			}';
			style = document.createElement( 'style' );
			style.type = 'text/css';
			style.textContent = sheet;
			document.querySelector( 'head' ).appendChild( style );
		},
		init: function () {
			document.body.addEventListener( 'DOMNodeInserted', function ( e ) {
				if ( ( e.target.tagName === 'DIV' ) && ( e.target.getAttribute( 'id' ) && e.target.getAttribute( 'id' ).indexOf( 'siteTable' ) !== -1 ) ) {
					topCP.addTopLinks();
				}
			}, true );
			topCP.addStyle();
			topCP.addTopLinks();
		}
	};
	if ( document.body && document.querySelector( '.listing-page:not(.profile-page)' ) ) {
		setTimeout(function () {
			topCP.init();
		}, 300);
	} else {
		window.addEventListener( 'load', function () {
			topCP.init();
		}, false );
	}
})();