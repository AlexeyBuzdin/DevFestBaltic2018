import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import config from '../../configs/firebase';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import { route } from 'preact-router';

const app = firebase.initializeApp(config);

const slugify = (str) => {
	str = str.replace(/^\s+|\s+$/g, ''); // trim
	str = str.toLowerCase();

	// remove accents, swap ñ for n, etc
	const from = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
	const to = 'aaaaaaeeeeiiiioooouuuunc------';
	for (let i=0, l=from.length ; i<l ; i++) {
		str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
	}

	return str
		.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
		.replace(/\s+/g, '-') // collapse whitespace and replace by -
		.replace(/-+/g, '-') // collapse dashes
		.replace(/^-+/, '') // trim - from start of text
		.replace(/-+$/, ''); // trim - from end of text
};

const total = (items) => {
	let sum = 0;
	items.forEach(i => sum += i.val.votes_count);
	return sum;
};

const shareText = 'I have voted for APP in CATEGORY category. Vote for the best app in each category and win Xiaomi Mi Band 3!';

class Home extends Component {

	getModalContainerClass = () => {
		if (this.state.showLogin || this.state.slug) {
			return 'modal-container modal-container_visible';
		}
		return 'modal-container';
	}

	getPageWrapperClass = () => {
		if (this.state.showLogin || this.state.slug) {
			return 'page-wrapper page-wrapper_blur';
		}
		return 'page-wrapper';
	}

	handleSignInOpen = (e) => {
		e.preventDefault();
		this.setState({ showLogin: true });
		document.body.classList.add('body-no-scroll');
	}

	handleCloseModal = (e) => {
		e.preventDefault();
		this.setState({ showLogin: false, showShare: false }, () => {
			route('/', true);
		});
		document.body.classList.remove('body-no-scroll');
	}

	handleChoose = (e, selectedApp) => {
		e.preventDefault();
		const { user } = this.state;
		document.body.classList.add('body-no-scroll');
		if (!user) {
			this.setState({ showLogin: true });
		}
		else {
			let updates = {};
			if (!selectedApp.votes) {
				selectedApp.votes = [];
			}
			firebase.database().ref().child('votes').push();
			const newVoteKey = selectedApp.val.category + '_' + user.uid;
			updates['/votes/' + newVoteKey] = {
				app_id: selectedApp.key,
				user_id: user.uid,
				category: selectedApp.val.category
			};
			firebase.database().ref().update(updates).then(() => {
				this.loadData();
				this.setState({ showShare: true });
			});
		}
	}

	handleSocialLogin = (e, provider) => {
		e.preventDefault();
		const that = this;
		firebase.auth().signInWithPopup(provider).then((result) => {
			that.setState({ showLogin: false }, () => {
				document.body.classList.remove('body-no-scroll');
			});
		  }).catch((error) => {
			console.dir(error);
		  });
	}

	handleFacebookShare = (e, selectedApp) => {
		e.preventDefault();
		FB.ui(
			{
			  method: 'share',
			  href: 'https://best-app-awards.firebaseapp.com',
			  quote: shareText.replace('APP', selectedApp.val.title).replace('CATEGORY', this.getCategory(selectedApp.val.category))
			}
		  );
	}

	handleSendEmail = (e) => {
		e.preventDefault();
		const { email } = this.state;
		const newEmailKey = firebase.database().ref().child('emails').push().key;
		let updates = {};
		updates['/emails/' + newEmailKey] = { email };
		firebase.database().ref().update(updates).then(() => {
			alert('Thank you!');
			this.setState({ email: null });
		});
	}

	loadData = () => {
		const ref = app.database().ref('apps');
		ref.on('value', (snapshot) => {
			let items = [];
			snapshot.forEach((childSnapshot) => {
				items.push({
					key: childSnapshot.key,
					val: {
						...childSnapshot.val(),
						votes_count: 0
					}
				});
			});
			this.setState({ apps: items });
		}, (err) => {
			console.log(err);
		});

		firebase.auth().onAuthStateChanged(user => this.setState({ user }));

		const votes = app.database().ref('votes');
		votes.on('value', (snapshot) => {
			let items = [];
			let appsVotes = {};
			snapshot.forEach((childSnapshot) => {
				const item = childSnapshot.val();
				if (!appsVotes[item.app_id]) {
					appsVotes[item.app_id] = 0;
				}
				appsVotes[item.app_id]++;
				items.push(item);
			});
			let { apps } = this.state;
			for (const appId in appsVotes) {
				for (const key in apps) {
					if (apps[key].key === appId) {
						apps[key].val.votes_count = appsVotes[appId];
					}
				}
			}
			this.setState({ votes: items, apps });
		}, (err) => {
			console.log(err);
		});
	}

	getCategory = (category) => {
		switch (category) {
			case 'design':
				return 'Best Design';
			case 'indie':
				return 'Best Indie App';
			case 'features':
				return 'Best Features';
		}

	}

	constructor(props) {
		super(props);

		const slug = props.matches.slug || null;
		this.state = {
			showLogin: false,
			showShare: false,
			apps: [],
			showAllDesigns: false,
			showAllFeatures: false,
			showAllIndies: false,
			email: null,
			user: null,
			votes: [],
			slug
		};
		if (slug) {
			document.body.classList.add('body-no-scroll');
		}
		else {
			document.body.classList.remove('body-no-scroll');
		}
		this.loadData();
	}

	componentWillReceiveProps(nextProps) {
		const slug = nextProps.matches.slug || null;
		this.setState({ slug });
		if (slug) {
			document.body.classList.add('body-no-scroll');
		}
		else {
			document.body.classList.remove('body-no-scroll');
		}
	}

	renderAppItem = (item) => {
		const { votes, user } = this.state;
		let isYour = false;
		if (user) {
			isYour = !!votes.find(v => user && v.app_id === item.key && v.category === item.val.category && v.user_id === user.uid);
		}
		let cssClass = 'app-card__engage-button';
		if (isYour) {
			cssClass += ' app-card__engage-button_your-choice';
		}
		return (
			<Link class="app-card" href={`/${slugify(item.val.name)}`}>
				<div class="app-card__content">
					<div class="app-card__icon"><img src={item.val.icon} /></div>
					<div class="app-card__name"><span>{item.val.name}</span></div>
					<div class="app-card__votes"><span>{item.val.votes_count}</span>votes</div>

					<span class={cssClass} role="button">
						{isYour ? 'Your vote' : 'Vote'}
					</span>
				</div>
			</Link>
		);
	}

	render() {
		const { showLogin, showShare, slug, apps, votes, showAllDesigns, showAllFeatures, showAllIndies, user, email } = this.state;

		const designsApps = apps.filter(app => app.val.category === 'design').sort((a, b) => a.val.votes_count < b.val.votes_count);
		const slicedDesignsApps = apps.filter(app => app.val.category === 'design').sort((a, b) => a.val.votes_count < b.val.votes_count).splice(0, 4);
		const featuresApps = apps.filter(app => app.val.category === 'features').sort((a, b) => a.val.votes_count < b.val.votes_count);
		const slicedFeaturesApps = apps.filter(app => app.val.category === 'features').sort((a, b) => a.val.votes_count < b.val.votes_count).splice(0, 4);
		const indiesApps = apps.filter(app => app.val.category === 'indie').sort((a, b) => a.val.votes_count < b.val.votes_count);
		const slicedIndiesApps = apps.filter(app => app.val.category === 'indie').sort((a, b) => a.val.votes_count < b.val.votes_count).splice(0, 4);

		const selectedApp = apps.find(i => slugify(i.val.name) === slug);

		return (
			<div>
				<header class="header">
					<a href="https://docs.google.com/forms/d/1_c0L29aClEeACm9r9xvR6IlLaiED_ij6OkIFzvMAUkM/edit?usp=sharing" target="_blank" class="nominate-the-app-button">Nominate the app</a>
					<div class="mobile-nav">
						<div class="mobile-nav__title">Categories:</div>
						<div class="mobile-nav__item">Best design award 2018</div>
						<div class="mobile-nav__item">Best features award 2018</div>
						<div class="mobile-nav__item">Best indie app award 2018</div>
					</div>
					<div class="header-login-block">
						<div class="header-login-block__avatar-container">
							<div class="header-login-block__avatar">
								{user && <img src={user.photoURL} />}
							</div>
						</div>
						{user ? (
							<a href="#" class="header-login-block__sign-in-and-out" role="button" onClick={e => {
								e.preventDefault();
								firebase.auth().signOut().then(() => {
									this.setState({ user: null });
								});
							}}
							>Sign out</a>
						) : (
							<a href="#" class="header-login-block__sign-in-and-out" role="button" onClick={this.handleSignInOpen}>Sign in</a>
						)}
					</div>
					<a href="#" class="mobile-nav-closer" role="button" onClick={e => {
					  e.preventDefault();
					  document.body.classList.remove('body-no-scroll');
					  document.querySelector('.header').classList.remove('header_opened');
				  }}
					/>
				</header>
				<div class={this.getPageWrapperClass()}>
				  <a href="#" class="mobile-nav-opener" role="button" onClick={e => {
					  e.preventDefault();
					  document.body.classList.add('body-no-scroll');
					  document.querySelector('.header').classList.add('header_opened');
				  }}
				  />
					<section class="prize-disclaimer">
						<div class="prize-info-block">
							<div class="prize-info-block__title">
							Best App Awards 2018 is the first mobile application award in Baltics. Award is supported by DevFestBaltics conference.<br/><br/>
							Vote for the best app in each category and win Xiaomi Mi Band 3!
							</div>


<div class="prize-info-block__text"><br/><br/>Rules:<br/><br/>
	<ul>
<li>1. Person must vote for the app in each category (Best Design, Best Features, Best Indie) and share any decision on Facebook or Twitter.</li>
<li>2. Lottery is held from 16.11.2018 to 13.12.2018.</li>
<li>3. Lottery results will be published on Facebook DevFestBaltics page on 14.11.2018. Results will be published on <a href="https://devfest2018.gdg.lv">DevFestBaltics 2018 site</a> on 14.12.2018.</li>
</ul>
</div>
						</div>
					</section>
					<section class="nomination-section">
						<h1 class="heading-h1">Category Best Design Award 2018</h1>
						<div class="heading-desc">Design that inspires</div>

						<div class="votes-counter"><span>{total(designsApps)}</span>votes</div>
						<div class="leaders-block">
							<div class="leaders-block__title">Leaders</div>
							<div class="leading-apps">
								{(showAllDesigns ? designsApps : slicedDesignsApps).map(item => (
									this.renderAppItem(item)
								))}
							</div>
						</div>
						{designsApps.length > 4 && !showAllDesigns && (
							<a class="view-all-link" href="#" onClick={e => {
								e.preventDefault();
								this.setState({ showAllDesigns: true });
							}}
							>View All<span>{designsApps.length}</span>Nominates</a>
						)}
					</section>
					<section class="nomination-section">
						<h1 class="heading-h1">Category Best Features Award 2018</h1>
						<div class="heading-desc">Features you adore</div>
						<div class="votes-counter"><span>{total(featuresApps)}</span>votes</div>
						<div class="leaders-block">
							<div class="leaders-block__title">Leaders</div>
							<div class="leading-apps">
								{(showAllFeatures ? featuresApps : slicedFeaturesApps).map(item => (
									this.renderAppItem(item)
								))}
							</div>
						</div>
						{featuresApps.length > 4 && !showAllFeatures && (
							<a class="view-all-link" href="#" onClick={e => {
								e.preventDefault();
								this.setState({ showAllFeatures: true });
							}}
							>View All<span>{featuresApps.length}</span>Nominates</a>
						)}
					</section>
					<section class="nomination-section">
						<h1 class="heading-h1">Category Best Indie App Award 2018</h1>
						<div class="heading-desc">1-3 developer team who made awesome app</div>
						<div class="votes-counter"><span>{total(indiesApps)}</span>votes</div>
						<div class="leaders-block">
							<div class="leaders-block__title">Leaders</div>
							<div class="leading-apps">
								{(showAllIndies ? indiesApps : slicedIndiesApps).map(item => (
									this.renderAppItem(item)
								))}
							</div>
						</div>
						{indiesApps.length > 4 && !showAllIndies && (
							<a class="view-all-link" href="#" onClick={e => {
								e.preventDefault();
								this.setState({ showAllIndies: true });
							}}
							>View All<span>{indiesApps.length}</span>Nominates</a>
						)}
					</section>
					<footer class="footer">
						<div class="footer-subscribe-block">
							<div class="footer-subscribe-block__title">Subscribe for news</div>
							<form class="footer-subscribe-block__form" onSubmit={this.handleSendEmail}>
								<input class="footer-subscribe-block__input" type="email" required value={email} onChange={e => {
									this.setState({ email: e.target.value });
								}}
								/>
								<button class="footer-subscribe-block__submit">Subscribe</button>
							</form>
						</div>
						<div class="footer-links-block">
							<div class="footer-links-block__column">
								<div class="footer-links-block__title">Follow us</div>
								<div class="follow-us-links"><a class="follow-us-links__link follow-us-links__link_twitter" href="#" /><a class="follow-us-links__link follow-us-links__link_fb" href="#" /></div>
							</div>
							<div class="footer-links-block__column">
								<div class="footer-links-block__title">Organizers</div><a class="oraganizer-gdg-riga" href="https://gdgriga.lv/" target="_blank"><span /></a><a class="oraganizer-gdg-daugavpils" href="https://www.meetup.com/GDG-Daugavpils/" target="_blank"><span /></a>
							</div>
							<div class="footer-links-block__column">
								<div class="footer-links-block__title">Partners</div>
								<div class="partner-google" />
							</div>
						</div>
						<div class="footer-copyright">&copy;2018</div>
					</footer>
				</div>
				<div class={this.getModalContainerClass()}>
					{selectedApp && (
						<div class="app-modal modal modal_visible">
							<div class="modal-head">
								<div class="modal-head__title modal-head__title_app">{selectedApp.val.name}</div>
								<Link class="modal-close" href="/" />
							</div>
							<div class="modal-content">
								<div class="app-modal-content">
									<div class="app-modal-content__app-links">
										<div class="app-card__icon"><img src={selectedApp.val.icon} /></div>
										{selectedApp.val.apple_url && <a class="app-link-appstore" href={selectedApp.val.apple_url} target="_blank" />}
										{selectedApp.val.google_url && <a class="app-link-gplay" href={selectedApp.val.google_url} target="_blank" />}
									</div>
									<div class="app-modal-content__description">
										<div class="modal-heading">{selectedApp.val.title}</div>
										<div class="modal-text">{selectedApp.val.description}</div>
										<div class="app-modal-bottom">
											{votes.find(v => user && v.app_id === selectedApp.key && v.category === selectedApp.val.category && v.user_id === user.uid) ? (
												<span class="app-modal-bottom__choose app-modal-bottom__your-choice" role="button">Your vote</span>
											) : (
												<a href="#" class="app-modal-bottom__choose" role="button" onClick={e => this.handleChoose(e, selectedApp)}>Vote</a>
											)}
											<div class="app-modal-bottom__votes"><span>{selectedApp.val.votes_count}</span>votes</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{showLogin && (
						<div class="sign-in-modal modal modal_visible">
							<div class="modal-head">
								<div class="modal-head__title">Sign In with social network</div>
								<div class="modal-close" onClick={this.handleCloseModal} />
							</div>
							<div class="modal-content">
								<div class="sign-in-modal-content">
									<div class="modal-heading">Please Sign In to vote</div>
									<div class="sign-in-buttons">
										<div class="sign-in-buttons__facebook" onClick={e => this.handleSocialLogin(e, new firebase.auth.FacebookAuthProvider())} />
										<div class="sign-in-buttons__gplus" onClick={e => this.handleSocialLogin(e, new firebase.auth.GoogleAuthProvider())} />
									</div>
								</div>
							</div>
						</div>
					)}

					{showShare && (
						<div class="thank-you-modal modal modal_visible">
							<div class="modal-head">
								<div class="modal-head__title">Thank you!</div>
								<div class="modal-close" onClick={this.handleCloseModal} />
							</div>
							<div class="modal-content">
								<div class="sign-in-modal-content">
									<div class="modal-heading">Thank you for vote!</div>
									<div class="modal-text">Vote for the best app in each category and win Xiaomi Mi Band 3!</div>
									<div class="share-block">
										<div class="modal-text">"{
											shareText.replace('APP', selectedApp.val.title)
												.replace('CATEGORY', this.getCategory(selectedApp.val.category))
										}"</div>
										<div class="share-buttons-flex">
											<button class="facebook-share-button" onClick={e => this.handleFacebookShare(e, selectedApp)} style="margin-right: 0;" />

											<a class="twitter-share-button"
												href={`https://twitter.com/intent/tweet?text=${encodeURI(
													shareText.replace('APP', selectedApp.val.title)
														.replace('CATEGORY', this.getCategory(selectedApp.val.category))
												)}`} target="_blank" data-size="large"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default Home;
