from distanceMatrix import *
from random import *
from numpy import *

matrix = readDistanceMatrix("Distancias.txt")

def geometricDecay(T):
    return 0.98*T

def iterateDecay(T):
    return T/(1 + 0.001* T)

def initialTemp(Problem):
    return pathCost(Problem) * 5 # o *2 é só para teste

def createInitialSolution(problem):
    return [problem[0]] + sample(problem[1::], len(problem)-1) + [problem[0]]

def var_n_iter(n_iter):
    return n_iter * 1.01;

def neighbour(current):
    #duvidas
    neib1 = randint(1, len(current) -1)
    neib2 = randint(1, len(current) -1)
    while(pow(neib2-neib1,2) <= 1):
        neib2 = randint(1, len(current)-1)
    if(neib1>neib2):
        sliced = (current[neib2:neib1])[::-1] #[::-1] reverte o array
        return current[0:neib2] + sliced + current[neib1:len(current)]
    elif(neib1<neib2):
        sliced = (current[neib1:neib2])[::-1]
        return current[0:neib1] +sliced + current[neib2:len(current)]
    return current
    

def stopCriteria(n_iter, n_best, criteria):
    return n_iter/n_best > criteria # mudar este numero se der problemas

def pathCost(solution):
    dist = 0
    first = solution[0]
    for i in range(len(solution)-1):
        if i == len(solution):
            dist += distance(matrix, first, solution[i])
        else:
            dist += distance(matrix, solution[i], solution[i+1])
    return dist

def simulatedAnnealing(problem,n_iter,decay):
    current = createInitialSolution(problem)

    best = current
    worst = current
    init =  len(current) * sqrt(len(current))
    T = initialTemp(problem)
    nextSolution = [];
    n_best = 1
    total_iter = 0;
    while True:
        for i in range(int(n_iter)):
            total_iter += 1
            nextSolution = neighbour(current)
            d = pathCost(nextSolution) - pathCost(current)
            if d < 0:
                current = nextSolution
                if(pathCost(current) < pathCost(best)):
                    best = current
                    n_best += 1
                if(pathCost(current) > pathCost(worst)):
                    worst = current;
            else:
                prob = exp(-d/T)
                rand = uniform(0,1)
                if(rand < prob):
                    current = nextSolution #com probabilidade exp(-d/T)?
        if stopCriteria(n_iter,n_best,init):
            print("Total iterations: ", total_iter)
            print("worst path: ", worst)
            print("worst path cost: ",pathCost(worst))
            print("best path: ", best)
            print("best path cost: ",pathCost(best))
            return
        n_iter = var_n_iter(n_iter)
        T = decay(T)

#path = simulatedAnnealing(["Cerdeira", "Douro","Gonta","Infantado","Lourel","Nelas","Oura","Quebrada","Roseiral","Serra","Teixoso","Ulgueira"],100)

simulatedAnnealing(["Atroeira", "Douro", "Pinhal", "Teixoso", "Ulgueira", "Vilar"],1,geometricDecay)
simulatedAnnealing(["Cerdeira", "Douro", "Gonta", "Infantado", "Lourel", "Nelas", "Oura", "Quebrada", "Roseiral", "Serra", "Teixoso", "Ulgueira"],1, geometricDecay) 
simulatedAnnealing(["Belmar", "Cerdeira", "Douro", "Encosta", "Freita", "Gonta", "Horta", "Infantado", "Lourel", "Monte", "Nelas", "Oura", "Pinhal", "Quebrada", "Roseiral", "Serra", "Teixoso", "Ulgueira"],1, geometricDecay)
simulatedAnnealing(getAllCities(matrix),1,geometricDecay)

#print(path, "\ntotal cost: ", pathCost(path))



# [Atroeira, Freita, Lourel, Quebrada, Monte, Roseiral, Serra, Nelas, Jardim, Oura, Belmar, Gonta, Horta, Encosta, Infantado, Vilar, Ulgueira, Douro, Cerdeira, Teixoso, Pinhal, Atroeira] with a distance of: 1868

# [Atroeira, Pinhal, Teixoso, Douro, Ulgueira, Vilar, Atroeira] with a distance of: 700

# [Cerdeira, Teixoso, Lourel, Quebrada, Roseiral, Nelas, Serra, Gonta, Oura, Infantado, Douro, Ulgueira, Cerdeira] with a distance of: 1549

#[Belmar, Horta, Nelas, Serra, Roseiral, Monte, Quebrada, Lourel, Freita, Pinhal, Teixoso, Cerdeira, Ulgueira, Douro, Infantado, Encosta, Oura, Gonta, Belmar] with a distance of: 1718


# E1: Atroeira, Douro, Pinhal, Teixoso, Ulgueira, Vilar.
# E2: Cerdeira, Douro, Gonta, Infantado, Lourel, Nelas, Oura, Quebrada, Roseiral, Serra, Teixoso, Ulgueira
# E3: Belmar, Cerdeira, Douro, Encosta, Freita, Gonta, Horta, Infantado, Lourel, Monte, Nelas, Oura, Pinhal, Quebrada, Roseiral, Serra, Teixoso, Ulgueira.
# E4: todas as cidades
