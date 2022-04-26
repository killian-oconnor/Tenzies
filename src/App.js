import './App.css';
import Die from "./components/die"

// function App() {
//   return (
//     <main>
//         <container className="diceContainer">
//             <Die />
//             <Die />
//             <Die />
//             <Die />
//             <Die />
//             <Die />
//             <Die />
//             <Die />
//             <Die />
//             <Die />
//         </container>
//     </main>
//   );
// }

// export default App;


import React from "react"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"
import { useStopwatch } from 'react-timer-hook';


export default function App() {

  

    const {
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        reset,
      } = useStopwatch({ autoStart: false });

    const [dice, setDice] = React.useState(allNewDice())
    const [tenzies, setTenzies] = React.useState(false)
    const [rollCounter, setRollCounter] = React.useState(0)
    const[lowScore, setLowScore] = React.useState(localStorage.getItem("lowestScore") || 0);
    
    React.useEffect(() => {
        const allHeld = dice.every(die => die.isHeld)
        const firstValue = dice[0].value
        const allSameValue = dice.every(die => die.value === firstValue)
        if (allHeld && allSameValue) {
          pause();  
          setTenzies(true)
        }
    }, [dice])

    React.useEffect(() => {
      localStorage.setItem("lowestScore", lowScore);
      console.log("New fastest time set " + lowScore + " seconds")
  }, [lowScore])

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }
    
    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice
    }
    
    function rollDice() {

        if (rollCounter === 0) {
            start();
        }
        if(!tenzies) {
            setRollCounter(rollCounter + 1);
            setDice(oldDice => oldDice.map(die => {
                return die.isHeld ? 
                    die :
                    generateNewDie()
            }))
        } else {
            if (seconds + (minutes * 60) < lowScore) {
              setLowScore(seconds + (minutes * 60)); 
            }
            reset();
            setTenzies(false)
            setDice(allNewDice())
            setRollCounter(0)
        }
    }
    
    function holdDice(id) {
        setDice(oldDice => oldDice.map(die => {
            return die.id === id ? 
                {...die, isHeld: !die.isHeld} :
                die
        }))
    }
    
    const diceElements = dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    return (
        <>
          <main>
              {tenzies && <Confetti />}
              <h1 className="title">Tenzies</h1>
              <p className="instructions">Roll until all dice are the same. 
              Click each die to freeze it at its current value between rolls.</p>
              <div className="dice-container">
                  {diceElements}
              </div>
              <button 
                  className="roll-dice" 
                  onClick={rollDice}
              >
                  {tenzies ? "New Game" : "Roll"}
              </button>
              
          </main>
          <div className = "stats-tracker">
              {rollCounter > 0 && <h4>Number of Rolls made: {rollCounter}</h4>}
              {seconds > 0 && <h4>Time elapsed {minutes.toLocaleString(undefined, {minimumIntegerDigits: 2})}m : {seconds.toLocaleString(undefined, {minimumIntegerDigits: 2})}s</h4>}
              <h5>Fastest time so far: {lowScore > 0 ? lowScore + " seconds" : "No time set yet"}</h5>
          </div>
        </>
    )
}