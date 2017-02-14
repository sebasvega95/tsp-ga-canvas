import GeneticAlgorithm from 'genetic-algorithm-fw';
import Victor from 'victor';
import { clone, floor, shuffle, range, random } from 'lodash';

let canvas, ctx;
let population, cities;
const K = 500 * 500;
const populationSize = 20;
const numberOfCities = 3;
const cityColor = 'red', cityOutline = 'blue', cityRadius = 5;

function resize(canvas) {
  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  if (width != canvas.width || height != canvas.height) {
    canvas.width = width;
    canvas.height = height;
  }
}

const mutation = oldPhenotype => {
  let pos1 = random(numberOfCities);
  let pos2 = random(numberOfCities);
  while (pos1 == pos2)
    pos2 = random(numberOfCities);

  let newPhenotype = clone(oldPhenotype);
  [newPhenotype[pos1], newPhenotype[pos2]] = [
    newPhenotype[pos2],
    newPhenotype[pos1]
  ];

  return newPhenotype;
};
const crossover = (phenoTypeA, phenoTypeB) => {};
const fitness = phenotype => {
  let sum = 0;
  for (let i = 0; i < numberOfCities; i++) {
    let act = phenotype[i], next = phenotype[(i + 1) % numberOfCities];
    console.log(i, act, next);
    sum += cities[act].distance(cities[next]);
  }
  return K - sum;
};
const competition = (phenoTypeA, phenoTypeB) => {
  return fitness(phenoTypeA) > fitness(phenoTypeB);
};

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

  console.log(cities);
  console.log('before', population[0], fitness(population[0]));
  let a = mutation(population[0]);
  console.log('new', a, fitness(a));
  console.log('after', population[0], fitness(population[0]));

  animate();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

startAnimation();
