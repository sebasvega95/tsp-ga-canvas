import GeneticAlgorithm from 'genetic-algorithm-fw';
import Victor from 'victor';
import {
  clone,
  constant,
  floor,
  includes,
  random,
  range,
  shuffle,
  times
} from 'lodash';

let canvas, ctx;
let population, cities, ga;
const K = 500 * 500;
const populationSize = 20, numberOfCities = 10;
const cityColor = 'red', cityOutline = 'blue', cityRadius = 10;
const pathOutline = 'blue', genPathOutline = '#81C784';
let maxFitness, bestPhenotype;
let solutionText;

function mutation(oldPhenotype) {
  let pos1 = random(numberOfCities - 1);
  let pos2 = random(numberOfCities - 1);

  let newP = clone(oldPhenotype);
  [newP[pos1], newP[pos2]] = [newP[pos2], newP[pos1]];
  return newP;
}

function crossover(phenoTypeA, phenoTypeB) {
  let child = times(numberOfCities, constant(null));
  let pos1 = random(numberOfCities - 1);
  let pos2 = random(numberOfCities - 1);
  if (pos1 > pos2) [pos1, pos2] = [pos2, pos1];

  for (let i = 0; i < numberOfCities; i++) {
    if (i >= pos1 && i <= pos2) {
      child[i] = phenoTypeA[i];
    }
  }
  for (let i = 0; i < numberOfCities; i++) {
    if (!includes(child, phenoTypeB[i])) {
      for (let j = 0; j < numberOfCities; j++) {
        if (child[j] == null) {
          child[j] = phenoTypeB[i];
          break;
        }
      }
    }
  }

  return [child];
}

function fitness(phenotype) {
  let sum = 0;
  for (let i = 0; i < numberOfCities; i++) {
    let act = phenotype[i], next = phenotype[(i + 1) % numberOfCities];
    sum += cities[act].distance(cities[next]);
  }
  return K - sum;
}

function competition(phenoTypeA, phenoTypeB) {
  return fitness(phenoTypeA) > fitness(phenoTypeB);
}

function resize(canvas) {
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  if (width != canvas.width || height != canvas.height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function startAnimation() {
  canvas = document.getElementById('tsp-canvas');
  resize(canvas);
  ctx = canvas.getContext('2d');

  population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(shuffle(range(numberOfCities)));
  }

  cities = [];
  for (let i = 0; i < numberOfCities; i++) {
    let x = floor(random(0.1, 0.9) * canvas.width);
    let y = floor(random(0.1, 0.9) * canvas.height);
    cities.push(new Victor(x, y));
  }

  ga = new GeneticAlgorithm(
    mutation,
    crossover,
    fitness,
    competition,
    population,
    populationSize
  );

  maxFitness = -1;
  animate();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ga.evolve();

  let curPhenotype = ga.best();
  let curFitness = fitness(curPhenotype);
  if (curFitness > maxFitness) {
    maxFitness = curFitness;
    bestPhenotype = curPhenotype;
    solutionText.innerHTML = maxFitness.toFixed(2);
  }

  // Best in generation
  for (let i = 0; i < numberOfCities; i++) {
    let act = curPhenotype[i], next = curPhenotype[(i + 1) % numberOfCities];
    let c1 = cities[act], c2 = cities[next];
    ctx.beginPath();
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = genPathOutline;
    ctx.stroke();
  }

  // Best ever
  for (let i = 0; i < numberOfCities; i++) {
    let act = bestPhenotype[i], next = bestPhenotype[(i + 1) % numberOfCities];
    let c1 = cities[act], c2 = cities[next];
    ctx.beginPath();
    ctx.moveTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = pathOutline;
    ctx.stroke();
  }

  cities.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, cityRadius, 0, 2 * Math.PI);
    ctx.fillStyle = cityColor;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = cityOutline;
    ctx.stroke();
  });

  requestAnimationFrame(animate);
}

solutionText = document.getElementById('solution');
document.getElementById('start').onclick = () => startAnimation();
