import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import config from '../../configs/firebase';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

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
		this.setState({ showLogin: false });
		document.body.classList.remove('body-no-scroll');
	}

	handleChoose = (e, selectedApp) => {
		e.preventDefault();
		document.body.classList.add('body-no-scroll');
	}

	handleSocialLogin = (e, provider) => {
		e.preventDefault();
		const that = this;
		firebase.auth().signInWithPopup(provider).then((result) => {
			that.setState({ user: result.user, showLogin: false });
			window.localStorage.setItem('user', JSON.stringify(result.user));
		  }).catch((error) => {
			console.dir(error);
		  });
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

	constructor(props) {
		super(props);

		const slug = props.matches.slug || null;
		this.state = {
			showLogin: false,
			apps: [],
			user: window.localStorage.getItem('user') ? JSON.parse(window.localStorage.getItem('user')) : null,
			showAllDesigns: false,
			showAllFeatures: false,
			showAllIndies: false,
			email: null,
			slug
		};
		if (slug) {
			document.body.classList.add('body-no-scroll');
		}
		else {
			document.body.classList.remove('body-no-scroll');
		}
		const ref = app.database().ref('apps');
		ref.on('value', (snapshot) => {
			let items = [];
			snapshot.forEach((childSnapshot) => {
				items.push(childSnapshot.val());
			});
			this.setState({ apps: items });
		}, (err) => {
			console.log(err);
		});
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

	renderAppItem = (item) => (
		<Link class="app-card" href={`/${slugify(item.name)}`}>
			<div class="app-card__content">
				<div class="app-card__icon"><img src={item.icon} /></div>
				<div class="app-card__name"><span>{item.name}</span></div>
				<div class="app-card__votes"><span>0</span>votes</div>
				<span class="app-card__engage-button modal-opener" role="button">Choose</span>
			</div>
		</Link>
	)

	render() {
		const { showLogin, slug, apps, user, showAllDesigns, showAllFeatures, showAllIndies, email } = this.state;

		// TODO: to do this much better %)
		const designsApps = apps.filter(app => app.design);
		const slicedDesignsApps = apps.filter(app => app.design).splice(0, 4);
		const featuresApps = apps.filter(app => app.features);
		const slicedFeaturesApps = apps.filter(app => app.features).splice(0, 4);
		const indiesApps = apps.filter(app => app.indie);
		const slicedIndiesApps = apps.filter(app => app.indie).splice(0, 4);

		const selectedApp = apps.find(i => slugify(i.name) === slug);

		return (
			<div>
				<header class="header">
					<div class="nominate-the-app-button">Nominate the app</div><a class="see-the-prizes" href="#"><span>See the </span>prizes</a>
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
							<a href="#" class="header-login-block__sign-in-and-out modal-opener" role="button" onClick={e => {
								e.preventDefault();
								this.setState({ user: null });
								window.localStorage.removeItem('user');
							}}
							>Sign out</a>
						) : (
							<a href="#" class="header-login-block__sign-in-and-out modal-opener" role="button" onClick={this.handleSignInOpen}>Sign in</a>
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
							<div class="prize-info-block__title">Choose the app in each category and win a XIAMOMI MI BAND 3 BLACK</div>
							<div class="prize-info-block__text">Izlozes noteikumi: Lietotājam jāizvēlas viena lietotne katrā kategorijā (Best Design, Best Features, Best Indie). Izloze notiks no x.10.2018. līdz 16.11.2018. Izlozes rezultāti tiks publicēti https://devfest2018.gdg.lv vietnē 16.11.2018.</div>
						</div>
					</section>
					<section class="nomination-section">
						<h1 class="heading-h1">Category Best Design Award 2018</h1>
						<div class="votes-counter"><span>0</span>votes</div>
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
						<div class="votes-counter"><span>0</span>votes</div>
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
						<div class="votes-counter"><span>0</span>votes</div>
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
								<div class="modal-head__title modal-head__title_app">{selectedApp.name}</div>
								<Link class="modal-close" href="/" />
							</div>
							<div class="modal-content">
								<div class="app-modal-content">
									<div class="app-modal-content__app-links">
										<div class="app-card__icon"><img src={selectedApp.icon} /></div>
										{selectedApp.apple_url && <a class="app-link-appstore" href={selectedApp.apple_url} target="_blank" />}
										{selectedApp.google_url && <a class="app-link-gplay" href={selectedApp.google_url} target="_blank" />}
									</div>
									<div class="app-modal-content__description">
										<div class="modal-heading">{selectedApp.title}</div>
										<div class="modal-text">{selectedApp.description}</div>
										<div class="app-modal-bottom">
											<a class="app-modal-bottom__choose modal-opener" role="button" data-modal="thank-you">Choose</a>
											<div class="app-modal-bottom__votes"><span>0</span>votes</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
					
					{showLogin && (
						<div class="sign-in-modal modal modal_visible">
							<div class="modal-head">
								<div class="modal-head__title">Sign In With Social Network</div>
								<div class="modal-close"  onClick={this.handleCloseModal} />
							</div>
							<div class="modal-content">
								<div class="sign-in-modal-content">
									<div class="modal-heading">Please Sign in for voting</div>
									<div class="modal-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
									<div class="sign-in-buttons">
										<div class="sign-in-buttons__facebook" onClick={e => this.handleSocialLogin(e, new firebase.auth.FacebookAuthProvider())} />
										<div class="sign-in-buttons__gplus" onClick={e => this.handleSocialLogin(e, new firebase.auth.GoogleAuthProvider())} />
										<div class="sign-in-buttons__twitter" onClick={e => this.handleSocialLogin(e, new firebase.auth.TwitterAuthProvider())} />
									</div>
								</div>
							</div>
						</div>
					)}


					<div class="thank-you-modal modal">
						<div class="modal-head">
							<div class="modal-head__title">Thank you!</div>
							<div class="modal-close" />
						</div>
						<div class="modal-content">
							<div class="sign-in-modal-content">
								<div class="modal-heading">Thank You for your voice! </div>
								<div class="modal-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
								<div class="share-block">
									<div class="modal-text">“I have voted for Qfer in “Best Design App” category. Проголосуй и выиграй Xiami Mi Band 3!”</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Home;
