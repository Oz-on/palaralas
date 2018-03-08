/*
Author: Oskar Domingos
All rights reserved® 
*/

(function () {

  /*------Objects------*/

  // check that user use mobile device or not
  var isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
  };

  //main app object
  var app = {
    eventDependingOnDevice: isMobile.any() ? 'touchstart' : 'click',
    isLoading: true,
    spinner: document.querySelector('.loader'),
    addedWords: [],
    groups: [],
    cardTemplate: document.querySelector('.card-template'),
    container: document.querySelector('.container'),
    cardDialog: document.querySelector('.add-card-modal'),
    menu: {
      Container: document.querySelector('.menu'),
      visible: false
    },
    groupList: document.querySelector('.menu__group-list'),
    mode: 'words-mode'
  };

  /*****************************************************/
  /*Event Listeners for UI elements*/
  /*****************************************************/

  /*------------------------------------*/
  /*-------------header panel-----------*/
  /*------------------------------------*/
  //event listener for button that expand menu
  document.getElementById('menu-button').addEventListener(app.eventDependingOnDevice, function (event) {
    //if menu is hidden remove class that keep it hidden
    var button = event.target;
    if (!app.menu.visible) {
      button.classList.add('header__menu-button_active_true');
      app.menu.Container.classList.remove('menu_hidden');
      app.menu.visible = true;

    } else {
      //else add class that hide menu
      button.classList.remove('header__menu-button_active_true');
      app.menu.Container.classList.add('menu_hidden');
      app.menu.visible = false;
    }
  }, false);

  //event listener for button that shows dialog for adding card
  document.getElementById('add-dialog-button').addEventListener(app.eventDependingOnDevice, function (event) {
    //disable dialog for adding new card when app.mode is equal to the learn-mode
    if (app.mode === 'learn-mode') {
      return;
    }
    app.toggleAddDialog(false);
  }, false);

  /*----------------------------------------------*/
  /*-------------modal: add-card-dialog-----------*/
  /*----------------------------------------------*/

  //event listener for button that add card with words to the main container
  document.getElementById('add-card-button').addEventListener(app.eventDependingOnDevice, function () {
    //tutaj dodaj funkcje do dodawania fiszki
    var wordInput = document.getElementById('word');
    var translationInput = document.getElementById('translation');
    var selectedOptionValue = document.getElementById('groups').options[document.getElementById('groups').selectedIndex].value;
    var groupInput = document.getElementById('new-group-input');
    var word = wordInput.value;
    var translation = translationInput.value;
    var groupName = '';

    var isThatWordNew = true;
    app.addedWords.forEach(function (obj) {
      if (obj.word === word && obj.translation === translation) {
        isThatWordNew = false;
      }
    });

    //if checkbox is checked, make sure that group is selected
    if (document.getElementById('create-group-checkbox').checked) {
      //if selected option value is equal to 'nowa', that means user will create new group, so check input form
      if (selectedOptionValue === 'nowa') {
        //get value from group input
        //if the group input is empty 
        if (groupInput.value === '') {
          groupName = '';
        } else {
          //if input form isn't empty, get the value from it
          groupName = groupInput.value;
        }
      } else {
        //if selected option isn't equal to 'nowa' that means user has already created group
        //and name of the group is in the option in select element, so get this value
        groupName = selectedOptionValue;
      }

      //chceck that iputs aren't empty
      if (word !== '' && translation !== '' && groupName !== '' && isThatWordNew) {
        app.addCard(word, translation);
        //add new words with their translations to the addedWords object
        app.addedWords.push({
          word: word,
          translation: translation,
          group: groupName,
          toLearn: true
        });
        //add new group to the array if group is new
        if (app.groups.indexOf(groupName) === -1) {
          app.groups.push(groupName);
          app.addGroupsToMenu();
          app.updateSelectElem();
        }
        //save added words in IDB
        app.saveAddedWords();

        //hide the dialog
        app.toggleAddDialog(true);
      }
    } else {
      if (word !== '' && translation !== '' && isThatWordNew) {
        app.addCard(word, translation);
        //add new words with their translations to the addedWords object
        app.addedWords.push({
          word: word,
          translation: translation,
          toLearn: true
        });
        app.saveAddedWords();
        app.toggleAddDialog(true);
      }
    }
    wordInput.value = '';
    translationInput.value = '';
    groupInput.value = '';
  }, false);

  //event listener for button that close (hide) dialag for adding card
  document.getElementById('close-container-button').addEventListener(app.eventDependingOnDevice, function () {
    app.toggleAddDialog(true);
  }, false);

  //event listener for checkbox to show or hide additional section for setting group
  document.getElementById('create-group-checkbox').addEventListener('change', function (event) {
    var groupingPannel = document.querySelector('.add-card-modal__groups-panel');
    //if checkbox is checked show section for setting group
    if (event.target.checked) {
      groupingPannel.removeAttribute('hidden');
      app.checkSelectedOption();
    } else {
      //else hide section for setting group
      groupingPannel.setAttribute('hidden', true);
    }
  });

  document.getElementById('groups').addEventListener('input', app.checkSelectedOption);

  // function checks what you have choosen in select element
  //and shows or hides input for new group
  app.checkSelectedOption = function (event) {
    var selectedOptionValue = document.getElementById('groups').options[document.getElementById('groups').selectedIndex].value;
    var groupInput = document.getElementById('new-group-input');
    //if selected option value is equal to 'nowa'
    if (selectedOptionValue === 'nowa') {
      //show text input where user can type name of new group
      groupInput.removeAttribute('hidden');
    } else {
      //else hide text input becouse user probably has created group before
      //so created group should displaying as an option in select element
      groupInput.setAttribute('hidden', true);
    }
  };

  //function hide or show modal
  app.toggleAddDialog = function (visible) {
    //if add dialog is visible
    if (visible) {
      //hide add dialog
      app.cardDialog.classList.add('add-card-modal_hidden');
      app.cardDialog.parentElement.classList.remove('modal-container_visible');
      if (app.isLoading) {
        app.spinner.removeAttribute('hidden');
      }
    } else {
      //show add dialog
      app.cardDialog.classList.remove('add-card-modal_hidden');
      app.cardDialog.parentElement.classList.add('modal-container_visible');
      if (app.isLoading) {
        app.spinner.setAttribute('hidden', true);
      }
    }
  };

  /*-----------------------------------------*/
  /*-------------menu and grouping-----------*/
  /*-----------------------------------------*/

  //event listener for list of groups in menu
  app.groupList.addEventListener(app.eventDependingOnDevice, function (event) {

    //check that link is a target
    if (event.target.className === 'menu__list-element' || event.target.className === 'menu__list-link') {
      event.preventDefault();
      //at first clear board
      app.clear(app.container);

      //when user clicks on 'Wszystkie' link then he will receive all card on main board
      if (event.target.textContent === 'Wszystkie') {
        //add all card on main board
        app.addedWords.forEach(function (obj) {
          app.addCard(obj.word, obj.translation);
        });
      }
      //if event.target.textContent is not equal to 'Wszystkie'
      //that mean, we can sort cards by group which user choose
      else {
        app.sortCards(event.target.textContent);
      }
      //change state of menu button and hide menu
      document.getElementById('menu-button').classList.remove('header__menu-button_active_true');
      app.menu.Container.classList.add('menu_hidden');
      app.menu.visible = false;
    }
  }, false);

  //when user click element in .menu__option-list 
  //target element will do appropriate task
  document.querySelector('.menu__option-list').addEventListener(app.eventDependingOnDevice, function (event) {
    //if target element has class name is equal to 'menu__list-element' or 'menu__list-link'
    if (event.target.className === 'menu__list-element' || event.target.className === 'menu__list-link') {
      //change mode
      app.mode = event.target.id;
      if (event.target.id === 'words-mode') {
        app.clear(app.container);
        app.updateBoard(app.addedWords);
      }
      if (event.target.id === 'learn-mode') {
        app.clear(app.container);
        app.enableLearningMode();
      }
    }
    //change state of menu button and hide menu
    document.getElementById('menu-button').classList.remove('header__menu-button_active_true');
    app.menu.Container.classList.add('menu_hidden');
    app.menu.visible = false;
  });

  /*------------------------------------------------*/
  /*-------------modal for removing cards-----------*/
  /*------------------------------------------------*/

  //close remove card modal when user click 'Zostaw' button
  document.querySelector('.remove-card-modal__leave-word-button').addEventListener(app.eventDependingOnDevice, function () {
    var removeCardModal = document.querySelector('.remove-card-modal');
    removeCardModal.classList.add('remove-card-modal_hidden');
    removeCardModal.parentElement.classList.remove('modal-container_visible');
  });

  //remove card when user click 'Usuń'
  document.querySelector('.remove-card-modal__remove-button').addEventListener(app.eventDependingOnDevice, function () {
    var removeCardModal = document.querySelector('.remove-card-modal');
    removeCardModal.classList.add('remove-card-modal_hidden');
    removeCardModal.parentElement.classList.remove('modal-container_visible');
    app.removeCard(app.clickedCard);

  });

  /***************************************************************/
  /*methods that operates with card and database to store words*/
  /***************************************************************/

  //Card object
  //object decorator pattern - I think :P
  //takes cloneNode as a parameter
  function Card(word, translation) {
    var element = app.cardTemplate.cloneNode(true);
    //remove styles that makes Card element invisible
    element.classList.remove('card-template');
    element.classList.remove('card-template_hidden');
    element.childNodes[1].textContent = word;
    element.childNodes[3].textContent = translation;
    return {
      elem: element,
      //this property defines which is on top of the board
      onTop: 'word',
      word: element.childNodes[1],
      translation: element.childNodes[3],
      reverseCard: function () {
        if (this.onTop === 'word') {
          this.word.classList.remove('card__word_visible');
          this.word.classList.add('card__word_hidden');
          this.translation.classList.remove('card__translation_hidden');
          this.translation.classList.add('card__translation_visible');
          this.onTop = 'translation';
        } else if (this.onTop === 'translation') {
          this.word.classList.remove('card__word_hidden');
          this.word.classList.add('card__word_visible');
          this.translation.classList.remove('card__translation_visible');
          this.translation.classList.add('card__translation_hidden');
          this.onTop = 'word';
        }
      }
    }
  }

  //function to adding card to main board
  app.addCard = function (word, translation) {
    var card = Card(word, translation);
    app.addReactionToClick(card);
    app.container.appendChild(card.elem);

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.classList.remove('container_hidden');
      app.isLoading = false;
    }
  };

  //when user click fast on card, card is revesed
  //when user press and hold mouse on card for more than 300ms, modal is displayed
  app.addReactionToClick = function (card) {
    var removeCardModal = document.querySelector('.remove-card-modal');
    //measure time between pressing and release card
    var t0, t1, difference;
    //if user is using mobile with touch screen
    //add event listeners on touch events
    if (isMobile.any()) {
      card.elem.addEventListener('touchstart', function () {
        t0 = performance.now();
      }, false);
      card.elem.addEventListener('touchend', function () {
        t1 = performance.now();
        difference = t1 - t0;
        //if user holds finger on card for 400ms or more
        if (difference >= 400) {
          //show modal for removing card
          removeCardModal.classList.remove('remove-card-modal_hidden');
          removeCardModal.parentElement.classList.add('modal-container_visible');
          //What is this???
          app.clickedCard = event.target.parentElement;
        } else {
          //if user holds finger on card for less than 400ms
          //reverse card
          card.reverseCard();
        }
      }, false);
    }
    //if user is using pc or laptop without touch screen
    //add event listeners on click events
    else {
      card.elem.addEventListener('mousedown', function (event) {
        t0 = performance.now();
      }, false);
      card.elem.addEventListener('mouseup', function (event) {
        t1 = performance.now();
        difference = t1 - t0;
        //if user holds clicked mouse on card for 350ms or more
        if (difference >= 350) {
          removeCardModal.classList.remove('remove-card-modal_hidden');
          removeCardModal.parentElement.classList.add('modal-container_visible');
          app.clickedCard = event.target.parentElement;
        } else {
          //if user holds mouse on card for less than 350ms
          //reverse card
          card.reverseCard();
        }
      }, false);
    }
  };

  //function that removes card with word with translations
  app.removeCard = function (card) {
    app.container.removeChild(card);
    var word = card.children[0].textContent;
    var translation = card.children[1].textContent;
    app.addedWords = app.addedWords.filter(function (obj) {
      if (obj.translation !== translation && obj.word !== word) {
        return obj;
      }
    });
    app.saveAddedWords();
    app.updateGroups();
    app.addGroupsToMenu();
    app.updateSelectElem();
  };

  //function adds groups to menu
  app.addGroupsToMenu = function () {
    //at first remove all groups except 'Wszystkie' category
    while (app.groupList.children.length > 2) {
      app.groupList.removeChild(app.groupList.lastChild);
    }
    //for each group from array
    //create link in menu
    app.groups.forEach(function (groupName) {
      var listElem = document.createElement('li');
      var linkElem = document.createElement('a');

      linkElem.classList.add('menu__list-link');
      linkElem.textContent = groupName;
      linkElem.setAttribute('href', '#' + groupName);
      listElem.classList.add('menu__list-element');
      listElem.appendChild(linkElem);
      app.groupList.appendChild(listElem);
    });
  };

  //function updates array of groups
  app.updateGroups = function () {
    //clear array
    app.groups = [];
    //check for groups property in objects from array
    app.addedWords.forEach(function (card) {
      if (card.group && app.groups.indexOf(card.group) === -1) {
        app.groups.push(card.group);
      }
    });

  };

  //function updates board by adding cards to it
  app.updateBoard = function (cards) {
    cards.forEach(function (card) {
      app.addCard(card.word, card.translation);
    });
  };

  //function 
  app.updateSelectElem = function () {
    var selectElem = document.getElementById('groups');
    while (selectElem.children.length > 1) {
      selectElem.removeChild(selectElem.lastChild);
    }
    app.groups.forEach(function (groupName) {
      var newOption = document.createElement('option');
      newOption.value = groupName;
      newOption.textContent = groupName;
      selectElem.appendChild(newOption);
    })
  };

  //function that add cards to the borad depending on which group player choose
  app.sortCards = function (groupName) {
    //remove all cards from board
    app.clear(app.container);
    //filter array of cards by groupName
    var cards = app.addedWords.filter(function (obj) {
      if (obj.group && obj.group === groupName) {
        return obj;
      }
    });
    //update board with filtered array of cards
    app.updateBoard(cards);
  };

  //function that removes all cards from board
  app.clear = function (element) {
    var i = (element.id === 'container') ? 1 : 0;
    while (element.children.length > i) {
      element.removeChild(element.lastChild);
    }
  };

  //save words that user add to the panel in the indexedDB
  app.saveAddedWords = function () {
    localforage.setItem('addedWords', app.addedWords);
  };

  //switch on learning mode
  app.enableLearningMode = function () {
    //at first clear board
    app.clear(app.container);

    //container for interaction an for cards
    var gameBoard = document.createElement('div');
    gameBoard.classList.add('game-board');
    gameBoard.id = ('game-board');
    //array for card elements that contain words to practise
    var wordsForQuiz = [];
    //container for buttons an input
    var interaction = document.createElement('div');
    interaction.classList.add('interaction');

    //append array with card elements that user has to practise
    app.addedWords.forEach(function (obj) {
      if (obj.toLearn) wordsForQuiz.push(Card(obj.word, obj.translation));
    });
    //when app does not has words saved except initial word
    if ((app.addedWords.length === 1 && app.addedWords[0].word === 'Hello') || app.addedWords.length === 0) {
      gameBoard.appendChild(interaction);
      //show interaction
      app.showInteraction('Nie dodałeś nowych słówek', interaction, false, gameBoard, wordsForQuiz);

    } else if (wordsForQuiz.length === 0) {
      //show interaction
      app.showInteraction('Przećwiczyłeś już wszystkie słówka', interaction, true, gameBoard, wordsForQuiz);

    } else {
      app.playQuiz(gameBoard, interaction, wordsForQuiz);
    }
    app.container.appendChild(gameBoard);
  };
  //function responsible for changing status
  //word: word that is the search key in app.addedWords object
  //bool: boolean on which we want to set toLearn property
  app.changeToLearnStatus = function (word, bool) {
    app.addedWords = app.addedWords.map(function (obj) {
      if (obj.word === word) {
        obj.toLearn = bool;
      }
      return obj;
    });
    app.saveAddedWords();
  }

  //function responsible for quiz
  //create game board and interaction for the quiz
  //gameBoard: div element for card and interaction;
  //interaction: div element for input and button;
  //wordsForQuiz: array of cards with word for quiz
  app.playQuiz = function (gameBoard, interaction, wordsForQuiz) {
    //clear gameBoard
    app.clear(gameBoard);
    //append array with card elements that user has to practise (it can be updated)
    if (wordsForQuiz.length === 0) {
      wordsForQuiz = [];
      app.addedWords.forEach(function (obj) {
        if (obj.toLearn) wordsForQuiz.push(Card(obj.word, obj.translation));
      });
    }

    var input = document.createElement('input');
    var checkButtonElement = document.createElement('button');
    checkButtonElement.classList.add('button');
    var correctAnsweredWords = [];
    var wrongAnsweredWords = [];
    //first object from array
    var card = wordsForQuiz.pop();
    //added card should be reversed
    card.reverseCard();

    checkButtonElement.textContent = 'Sprawdź';
    interaction.appendChild(input);
    interaction.appendChild(checkButtonElement);
    gameBoard.appendChild(interaction);
    gameBoard.appendChild(card.elem);

    //reaction on clicking the button
    checkButtonElement.addEventListener(app.eventDependingOnDevice, function () {
      var userInput = input.value;

      //compare user input to the word
      if (userInput.toLowerCase() === card.word.textContent.toLowerCase()) {
        correctAnsweredWords.push(card.word.textContent);
        //when user know that word, it means that he doesn't have to type it next time
        app.changeToLearnStatus(card.word.textContent, false);
        //if answer is correct - make background green
        card.translation.classList.remove('wrong-answer');
        card.translation.classList.add('correct-answer');
      } else {
        wrongAnsweredWords.push(card.word.textContent);
        //if answer is not correct - make background red
        card.translation.classList.remove('correct-answer');
        card.translation.classList.add('wrong-answer');
      }
      input.value = '';
      setTimeout(function () {
        if (wordsForQuiz.length >= 1) {
          gameBoard.removeChild(card.elem);
          card = wordsForQuiz.pop();
          card.reverseCard();
          gameBoard.appendChild(card.elem);
        } else {
          //after user wade through all words, show summary
          //at first clear gameBoard
          app.clear(gameBoard);
          //show interaction an allow user to play quiz again
          app.showInteraction('Czy chcesz spróbować jeszcze raz?', interaction, true, gameBoard, wordsForQuiz);
          //list with correct answers
          if (correctAnsweredWords.length > 0) {
            var correctAnswersList = document.createElement('ul');
            correctAnswersList.classList.add('summary-list');
            correctAnswersList.classList.add('summary-list_correct');
            correctAnswersList.textContent = "Słówka, które znasz";
            //append all words that users knows
            correctAnsweredWords.forEach(function (word) {
              var listItem = document.createElement('li');
              listItem.textContent = word;
              correctAnswersList.appendChild(listItem);
            });
            gameBoard.appendChild(correctAnswersList);
          }
          //list with wrong answers
          if (wrongAnsweredWords.length > 0) {
            var wrongAnswersList = document.createElement('ul');
            wrongAnswersList.classList.add('summary-list');
            wrongAnswersList.classList.add('summary-list_wrong');
            wrongAnswersList.textContent = "Słówka do przećwiczenia";
            //append all words that users doesn't know
            wrongAnsweredWords.forEach(function (word) {
              var listItem = document.createElement('li');
              listItem.textContent = word;
              wrongAnswersList.appendChild(listItem);
            });
            gameBoard.appendChild(wrongAnswersList);
          }
        }
      }, 500);
    });
  }

  //function responsible for showing interaction
  //infoTextElement
  app.showInteraction = function (infoText, interaction, toCreateButton, gameBoard, wordsForQuiz) {
    //clear interaction
    app.clear(interaction);
    var infoTextElement = document.createElement('p');
    infoTextElement.textContent = infoText;
    interaction.appendChild(infoTextElement);
    //when toCreateButton argument is true
    //create two buttons
    if (toCreateButton) {
      //when user traind well all words
      //create new interaction buttons
      var playAgainButtonElement = document.createElement('button');
      playAgainButtonElement.classList.add('button');
      var finishGameButtonElement = document.createElement('button');
      finishGameButtonElement.classList.add('button');
      //define buttons text Conent
      playAgainButtonElement.textContent = "Ćwicz dalej";
      finishGameButtonElement.textContent = "Zakończ";
      //div element that wraps buttons (for betterr styling)
      var wrapperElement = document.createElement('div');
      wrapperElement.appendChild(playAgainButtonElement);
      wrapperElement.appendChild(finishGameButtonElement)
      interaction.appendChild(wrapperElement);
      playAgainButtonElement.addEventListener(app.eventDependingOnDevice, function () {

        //when user click on button it means he want to do a quiz again
        //set all toLearn property of words to true
        app.addedWords.forEach(function (obj) {
          obj.toLearn = true;
        });
        //save objects with updated property
        app.saveAddedWords();
        //play new quiz
        app.clear(interaction);
        app.playQuiz(gameBoard, interaction, wordsForQuiz);
      });
      finishGameButtonElement.addEventListener(app.eventDependingOnDevice, function () {
        app.mode = 'learn-mode';
        app.clear(app.container);
        app.updateBoard(app.addedWords);
      });
    }
    gameBoard.appendChild(interaction);
  }
  //when user start up app, he will get words that was saved before
  app.startup = function () {
    //get list from indexedDB
    localforage.getItem('addedWords').then(function (data) {
      //if there is no words saved load initial data
      if (!data) {
        app.addCard('Hello', 'Witaj');
        app.addedWords = [{
          word: 'Hello',
          translation: 'Witaj'
        }];
        app.saveAddedWords();
      } else {
        app.addedWords = data;
        app.updateBoard(app.addedWords);
        app.updateGroups();
        app.addGroupsToMenu();
        app.updateSelectElem();
      }
    }).catch(function (err) {
      console.log(err);
    });
  };

  window.addEventListener('load', function () {
    //load cards with choosen words when app will be loaded
    app.startup();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(function (response) {})
        .catch(function () {
          console.log("cos sie popsulo");
        });
    }
  });

}());
