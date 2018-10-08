import { h, Component } from 'preact';
import config from '../../configs/firebase';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

const app = firebase.initializeApp(config);

class Home extends Component {

	getAvatarStyle = () => {
		const { user } = this.state;
		if (user) {
			return {
				backgroundImage: `url(${user.photoURL})`
			};
		}

		return {};
	}
	
	getModalContainerClass = () => {
		if (this.state.showLogin || this.state.selectedApp) {
			return 'modal-container modal-container_visible';
		}
		return 'modal-container';
	}

	getPageWrapperClass = () => {
		if (this.state.showLogin || this.state.selectedApp) {
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
		this.setState({ showLogin: false, selectedApp: null });
		document.body.classList.remove('body-no-scroll');
	}

	handleChoose = (e, selectedApp) => {
		e.preventDefault();
		this.setState({ selectedApp });
		document.body.classList.add('body-no-scroll');
	}

	handleSocialLogin = (e, provider) => {
		e.preventDefault();
		const that = this;
		firebase.auth().signInWithPopup(provider).then((result) => {
			that.setState({ user: result.user, showLogin: false });
		  }).catch((error) => {
			console.dir(error);
		  });
	}

	constructor(props) {
		super(props);
		this.state = {
			slug: null,
			showLogin: false,
			apps: [],
			selectedApp: null,
			user: null
		};
		const ref = app.database().ref().child('/');
		ref.on('value', (snapshot) => {
			snapshot.forEach((childSnapshot) => {
				if (childSnapshot.key === 'apps') {
					this.setState({ apps: Object.values(childSnapshot.val()) });
				}
			  });
		});
	}
	
	render() {
		const { showLogin, selectedApp, apps, user } = this.state;
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
							<div class="header-login-block__avatar" style={this.getAvatarStyle()} />
						</div>
						{user ? (
							<a href="#" class="header-login-block__sign-in-and-out modal-opener" role="button" onClick={e => {
								e.preventDefault();
								this.setState({ user: null });
							}}
							>Sign out</a>
						) : (
							<a href="#" class="header-login-block__sign-in-and-out modal-opener" role="button" onClick={this.handleSignInOpen}>Sign in</a>
						)}
					</div>
          <a class="mobile-nav-closer" role="button"></a>
				</header>
				<div class={this.getPageWrapperClass()}>
				  <a class="mobile-nav-opener" role="button"></a>
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
								{apps.filter(app => app.design).map(item => (
									<div class="app-card">
										<div class="app-card__content">
											<div class="app-card__icon"><img src={item.icon} /></div>
											<div class="app-card__name"><span>{item.name}</span></div>
											<div class="app-card__votes"><span>0</span>votes</div>
											<a href="#" class="app-card__engage-button modal-opener" role="button" onClick={e => this.handleChoose(e, item)}>Choose</a>
										</div>
									</div>
								))}
							</div>
						</div><a class="view-all-link" href="#">View All<span>54</span>Nominates</a>
					</section>
					<section class="nomination-section">
						<h1 class="heading-h1">Category Best Features Award 2018</h1>
						<div class="votes-counter"><span>0</span>votes</div>
						<div class="leaders-block">
							<div class="leaders-block__title">Leaders</div>
							<div class="leading-apps">
								{apps.filter(app => app.features).map(item => (
									<div class="app-card">
										<div class="app-card__content">
											<div class="app-card__icon"><img src={item.icon} /></div>
											<div class="app-card__name"><span>{item.name}</span></div>
											<div class="app-card__votes"><span>0</span>votes</div>
											<a href="#" class="app-card__engage-button modal-opener" role="button" onClick={e => this.handleChoose(e, item)}>Choose</a>
										</div>
									</div>
								))}
							</div>
						</div><a class="view-all-link" href="#">View All<span>18</span>Nominates</a>
					</section>
					<section class="nomination-section">
						<h1 class="heading-h1">Category Best Indie App Award 2018</h1>
						<div class="votes-counter"><span>0</span>votes</div>
						<div class="leaders-block">
							<div class="leaders-block__title">Leaders</div>
							<div class="leading-apps">
								{apps.filter(app => app.indie).map(item => (
									<div class="app-card">
										<div class="app-card__content">
											<div class="app-card__icon"><img src={item.icon} /></div>
											<div class="app-card__name"><span>{item.name}</span></div>
											<div class="app-card__votes"><span>0</span>votes</div>
											<a href="#" class="app-card__engage-button modal-opener" role="button" onClick={e => this.handleChoose(e, item)}>Choose</a>
										</div>
									</div>
								))}
							</div>
						</div><a class="view-all-link" href="#">View All<span>42</span>Nominates</a>
					</section>
					<footer class="footer">
						<div class="footer-subscribe-block">
							<div class="footer-subscribe-block__title">Subscribe for news</div>
							<form class="footer-subscribe-block__form">
								<input class="footer-subscribe-block__input" type="text" />
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
								<div class="modal-close" onClick={this.handleCloseModal} />
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
										<div class="sign-in-buttons__twitter" />
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
