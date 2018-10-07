import { h, Component } from 'preact';
import config from '../../configs/firebase';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

const app = firebase.initializeApp(config);

class Home extends Component {

	getModalContainerClass = () => {
		if (this.state.showLogin) {
			return 'modal-container modal-container_visible';
		}
		return 'modal-container';
	}

	getPageWrapperClass = () => {
		if (this.state.showLogin) {
			return 'page-wrapper page-wrapper_blur';
		}
		return 'page-wrapper';
	}

	handleSignInOpen = (e) => {
		e.preventDefault();
		this.setState({ showLogin: true });
		document.body.classList.add('body-no-scroll');
	}

	handleSignInClose = (e) => {
		e.preventDefault();
		this.setState({ showLogin: false });
		document.body.classList.remove('body-no-scroll');
	}

	constructor(props) {
		super(props);
		this.state = {
			slug: null,
			showLogin: false,
			apps: [],
			selectedApp: null
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
		const { showLogin, selectedApp, apps } = this.state;
		return (
			<div>
				<header class="header">
					<div class="nominate-the-app-button">Nominate the app</div><a class="see-the-prizes" href="#">See the prizes</a>
					<div class="header-login-block">
						<div class="header-login-block__avatar-container">
							<div class="header-login-block__avatar" />
						</div><a class="header-login-block__sign-in-and-out modal-opener" role="button" onClick={this.handleSignInOpen}>Sign in</a>
					</div>
				</header>
				<div class={this.getPageWrapperClass}>
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
											<a href="#" class="app-card__engage-button modal-opener" role="button" data-modal="app">Choose</a>
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
											<a href="#" class="app-card__engage-button modal-opener" role="button" data-modal="app">Choose</a>
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
											<a href="#" class="app-card__engage-button modal-opener" role="button" data-modal="app">Choose</a>
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
				<div class={this.getModalContainerClass}>
					{selectedApp && (
						<div class="app-modal modal">
							<div class="modal-head">
								<div class="modal-head__title modal-head__title_app">Qfer</div>
								<div class="modal-close" />
							</div>
							<div class="modal-content">
								<div class="app-modal-content">
									<div class="app-modal-content__app-links">
										<div class="app-card__icon"><img src="assets/img/apps/app-icon-4.png" /></div><a class="app-link-appstore" href="#" /><a class="app-link-gplay" href="#" />
									</div>
									<div class="app-modal-content__description">
										<div class="modal-heading">QFer — заказывай еду, получай бонусы</div>
										<div class="modal-text">Qfer поможет заказать обед или ужин из ресторанов и получать бонусы (предложения и кешбэк). Экономь время и деньги вместе с Qfer. Получай специальные предложения от таких брендов как Lulū, KFC, Lido, Čili Pica, Pizza Hut, Subburger и многих других.</div>
										<div class="app-modal-bottom"><a class="app-modal-bottom__choose modal-opener" role="button" data-modal="thank-you">Choose</a>
											<div class="app-modal-bottom__votes"><span>217</span>votes</div>
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
								<div class="modal-close"  onClick={this.handleSignInClose} />
							</div>
							<div class="modal-content">
								<div class="sign-in-modal-content">
									<div class="modal-heading">Please Sign in for voting</div>
									<div class="modal-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
									<div class="sign-in-buttons">
										<div class="sign-in-buttons__facebook" />
										<div class="sign-in-buttons__gplus" />
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
